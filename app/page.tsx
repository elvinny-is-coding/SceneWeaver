import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wand2, LayoutGrid, FileText, Download } from 'lucide-react'
import { DotPattern } from '@/components/magic/DotPattern'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'
import { BentoGrid, BentoCard } from '@/components/magic/BentoGrid'

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
        <DotPattern className="fill-foreground/10" />
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            AI Builders Challenge
          </span>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            <AnimatedGradientText>SceneWeaver</AnimatedGradientText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Turn your scripts into cinematic storyboards in seconds. AI-powered shot generation, drag-and-drop editing, and PDF export.
          </p>
          <div className="flex gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 max-w-6xl mx-auto">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground">
          Everything you need to visualise your story
        </h2>
        <BentoGrid>
          <BentoCard
            Icon={Wand2}
            name="AI Shot Generation"
            description="Paste your scene script. Get 4–6 cinematic shots with angles, framing, mood, and image prompts — instantly."
          />
          <BentoCard
            Icon={LayoutGrid}
            name="Drag-and-Drop Board"
            description="Reorder shots by dragging. Every change persists to the database in real time."
          />
          <BentoCard
            Icon={FileText}
            name="Screenplay Editor"
            description="Write your script with a purpose-built editor that understands Scene Headings, Action, Character, and Dialogue."
          />
          <BentoCard
            Icon={Download}
            name="PDF Export"
            description="Compile your storyboard into a high-resolution PDF with one click."
          />
        </BentoGrid>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">
          SceneWeaver · Built for the AI Builders Challenge
        </p>
      </footer>
    </div>
  )
}
