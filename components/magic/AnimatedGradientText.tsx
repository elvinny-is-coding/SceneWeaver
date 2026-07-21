// Library: Magic UI
// Path: components/magic/AnimatedGradientText.tsx
'use client'

import { cn } from '@/lib/utils'

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        'inline-block bg-gradient-to-r from-primary via-primary/50 to-primary',
        'bg-[length:200%_auto] bg-clip-text text-transparent',
        'motion-safe:animate-[gradient-shift_3s_linear_infinite]',
        className
      )}
    >
      {children}
    </span>
  )
}
