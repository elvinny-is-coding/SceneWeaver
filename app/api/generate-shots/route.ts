import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseServiceClient } from '@/lib/supabase/service'
import { getRequiredServerEnv } from '@/lib/env'
import type { ContinuityContext } from '@/lib/types'

// Vercel Hobby max is 60s
export const maxDuration = 60

interface ShotInternal {
  shot_number: number
  angle: string
  framing: string
  movement: string
  mood: string
  visual_prompt: string
}

type ShotPublic = Omit<ShotInternal, 'visual_prompt'> & {
  id: string
  scene_id: string
  order_index: number
  image_url: string | null
}

interface RequestBody {
  scene_id: string
  script: string
  continuity_context?: ContinuityContext[]
}

const STYLE_LOCK =
  'monochrome pencil-sketch storyboard style, consistent linework, cinematic framing'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const REQUIRED_FIELDS: (keyof ShotInternal)[] = [
  'shot_number', 'angle', 'framing', 'movement', 'mood', 'visual_prompt',
]

function sanitizeScript(raw: string): string {
  return raw.trim().slice(0, 2000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

function extractJson(raw: string): unknown[] | null {
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1))
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function validateShot(obj: unknown): obj is ShotInternal {
  if (typeof obj !== 'object' || obj === null) return false
  const r = obj as Record<string, unknown>
  return REQUIRED_FIELDS.every(
    (f) => f in r && typeof r[f] === (f === 'shot_number' ? 'number' : 'string')
  )
}

function buildPrompt(script: string, context: ContinuityContext[]): string {
  const continuityBlock =
    context.length > 0
      ? `\n\nContinuity constraints from prior shots (hold constant unless script changes them):\n${JSON.stringify(context, null, 2)}`
      : ''
  return `You are a professional storyboard supervisor. Convert the scene script below into exactly 4 to 6 shots.

Return ONLY a valid JSON array. No markdown, no explanation, no wrapper text.

Each object must have exactly these fields:
- shot_number (integer, starting at 1)
- angle (string, e.g. "close-up", "wide", "dutch")
- framing (string, e.g. "over-the-shoulder", "two-shot")
- movement (string, e.g. "static", "dolly-in", "pan-left")
- mood (string, one or two words)
- visual_prompt (string ending with: "${STYLE_LOCK}")
${continuityBlock}

Scene script:
${script}`
}

// Cloudflare Workers AI — text inference
async function callCloudflareText(prompt: string): Promise<string> {
  const apiKey = getRequiredServerEnv('CLOUDFLARE_WORKER_AI_API_KEY')
  const accountId = getRequiredServerEnv('CLOUDFLARE_WORKER_AI_ACCOUNT_ID')
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a professional storyboard supervisor. Return only valid JSON arrays with no markdown or explanation.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(50_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Cloudflare AI text HTTP ${res.status}: ${body.slice(0, 200)}`)
  }

  // Cloudflare Workers AI response shape: { result: { response: string }, success: boolean }
  const data = await res.json() as { result?: { response?: string }; success?: boolean; errors?: { message: string }[] }

  if (!data.success) {
    const msg = data.errors?.map((e) => e.message).join(', ') ?? 'Unknown error'
    throw new Error(`Cloudflare AI error: ${msg}`)
  }

  return data.result?.response ?? ''
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
    .eq('route', 'generate-shots')
    .single()

  const now = Date.now()
  const windowMs = 60_000
  const threshold = 20

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

  const { scene_id, script, continuity_context = [] } = body

  if (!scene_id || !UUID_RE.test(scene_id))
    return NextResponse.json({ error: 'Invalid scene_id' }, { status: 400 })
  if (!script || typeof script !== 'string')
    return NextResponse.json({ error: 'Missing script' }, { status: 400 })

  const cleanScript = sanitizeScript(script)

  // ── Ownership check ────────────────────────────────────────
  const { data: sceneOwner } = await supabase
    .from('scenes').select('id').eq('id', scene_id).single()
  if (!sceneOwner)
    return NextResponse.json({ error: 'Scene not found' }, { status: 404 })

  // ── Call Cloudflare AI with one retry on parse failure ─────
  const prompt = buildPrompt(cleanScript, continuity_context)
  let shots: ShotInternal[] | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    let raw: string
    try {
      raw = await callCloudflareText(prompt)
    } catch (error) {
      if (attempt === 1) {
        console.error('Cloudflare AI text request failed:', error)
        return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
      }
      continue
    }
    const parsed = extractJson(raw)
    if (parsed && parsed.every(validateShot)) {
      shots = parsed as ShotInternal[]
      break
    }
    if (attempt === 1)
      return NextResponse.json({ error: 'AI returned unparseable output' }, { status: 502 })
  }

  if (!shots)
    return NextResponse.json({ error: 'Shot generation failed' }, { status: 502 })

  // ── Enforce style-lock suffix ──────────────────────────────
  const lockedShots = shots.map((s) => ({
    ...s,
    visual_prompt: s.visual_prompt.endsWith(STYLE_LOCK)
      ? s.visual_prompt
      : `${s.visual_prompt.trimEnd()}, ${STYLE_LOCK}`,
  }))

  // ── Determine base order_index ─────────────────────────────
  const { data: existing } = await supabase
    .from('shots').select('order_index')
    .eq('scene_id', scene_id)
    .order('order_index', { ascending: false })
    .limit(1)
  const baseIndex = existing?.[0]?.order_index ?? -1

  // ── Persist via service/secret client ─────────────────────
  const service = getSupabaseServiceClient()
  const rows = lockedShots.map((s, i) => ({
    scene_id,
    shot_number: s.shot_number,
    angle: s.angle,
    framing: s.framing,
    movement: s.movement,
    mood: s.mood,
    visual_prompt: s.visual_prompt,
    order_index: baseIndex + 1 + i,
    image_url: null,
  }))

  const { data: inserted, error: insertError } = await service
    .from('shots')
    .insert(rows)
    .select('id, scene_id, shot_number, angle, framing, movement, mood, order_index, image_url')

  if (insertError || !inserted)
    return NextResponse.json({ error: 'Database write failed' }, { status: 500 })

  // ── Update rate limit ──────────────────────────────────────
  if (rl && now - new Date(rl.window_start).getTime() < windowMs) {
    await supabase.from('rate_limits')
      .update({ count: rl.count + 1 })
      .eq('user_id', user.id).eq('route', 'generate-shots')
  } else {
    await supabase.from('rate_limits')
      .upsert({ user_id: user.id, route: 'generate-shots', window_start: new Date().toISOString(), count: 1 })
  }

  const publicShots: ShotPublic[] = inserted
  return NextResponse.json({ shots: publicShots }, { status: 200 })
}
