import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseServiceClient } from '@/lib/supabase/service'
import { getRequiredServerEnv } from '@/lib/env'

// Vercel Hobby max is 60s — image generation can be slow
export const maxDuration = 60

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface RequestBody {
  shot_id: string
}

// Cloudflare Workers AI — flux-1-schnell returns raw PNG bytes
async function generateImageWithRetry(visualPrompt: string): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const apiKey = getRequiredServerEnv('CLOUDFLARE_WORKER_AI_API_KEY')
  const accountId = getRequiredServerEnv('CLOUDFLARE_WORKER_AI_ACCOUNT_ID')
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: visualPrompt,
          num_steps: 4,       // flux-schnell optimal step count
          width: 768,
          height: 432,
        }),
        signal: AbortSignal.timeout(50_000),
      })

      if (!res.ok) {
        if (attempt === 1) throw new Error(`Cloudflare AI image HTTP ${res.status}`)
        continue
      }

      // Cloudflare flux returns JSON: { result: { image: "<base64>" }, success: true }
      const data = await res.json() as {
        result?: { image?: string }
        success?: boolean
        errors?: { message: string }[]
      }

      if (!data.success || !data.result?.image) {
        const msg = data.errors?.map((e) => e.message).join(', ') ?? 'No image returned'
        if (attempt === 1) throw new Error(`Cloudflare AI image error: ${msg}`)
        continue
      }

      // Decode base64 image from Cloudflare response
      const binaryStr = atob(data.result.image)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      return { buffer: bytes.buffer, contentType: 'image/png' }

    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Image generation failed after retries')
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth ───────────────────────────────────────────────────
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Rate limit ─────────────────────────────────────────────
  const { data: rl } = await supabase
    .from('rate_limits')
    .select('window_start, count')
    .eq('user_id', user.id)
    .eq('route', 'generate-image')
    .single()

  const now = Date.now()
  const windowMs = 60_000
  const threshold = 30

  if (rl) {
    const age = now - new Date(rl.window_start).getTime()
    if (age < windowMs && rl.count >= threshold) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((windowMs - age) / 1000)) } }
      )
    }
  }

  // ── Parse body ─────────────────────────────────────────────
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { shot_id } = body
  if (!shot_id || !UUID_RE.test(shot_id))
    return NextResponse.json({ error: 'Invalid shot_id' }, { status: 400 })

  // ── Fetch visual_prompt — RLS enforces ownership ───────────
  const { data: shot } = await supabase
    .from('shots').select('id, visual_prompt').eq('id', shot_id).single()
  if (!shot)
    return NextResponse.json({ error: 'Shot not found' }, { status: 404 })

  // ── Generate image via Cloudflare Workers AI ───────────────
  let imageBuffer: ArrayBuffer
  let contentType: string
  try {
    const result = await generateImageWithRetry(shot.visual_prompt)
    imageBuffer = result.buffer
    contentType = result.contentType
  } catch (error) {
    console.error('Cloudflare image generation failed:', error)
    // visual_prompt intentionally excluded from error response
    return NextResponse.json({ error: 'Image generation failed' }, { status: 502 })
  }

  // ── Persist image_url via service/secret client ────────────
  const base64 = Buffer.from(imageBuffer).toString('base64')
  const dataUrl = `data:${contentType};base64,${base64}`

  const service = getSupabaseServiceClient()
  const { error: updateError } = await service
    .from('shots').update({ image_url: dataUrl }).eq('id', shot_id)

  if (updateError)
    return NextResponse.json({ error: 'Failed to persist image' }, { status: 500 })

  // ── Update rate limit ──────────────────────────────────────
  if (rl && now - new Date(rl.window_start).getTime() < windowMs) {
    await supabase.from('rate_limits')
      .update({ count: rl.count + 1 })
      .eq('user_id', user.id).eq('route', 'generate-image')
  } else {
    await supabase.from('rate_limits')
      .upsert({ user_id: user.id, route: 'generate-image', window_start: new Date().toISOString(), count: 1 })
  }

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: { 'Content-Type': contentType },
  })
}
