// Library: Magic UI
// Path: components/magic/ShimmerButton.tsx
'use client'

import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  className?: string
  children: React.ReactNode
}

export function ShimmerButton({
  shimmerColor = 'rgba(255,255,255,0.15)',
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md',
        'bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
        'transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 motion-safe:animate-[shimmer_2s_infinite]"
        style={{
          background: `linear-gradient(105deg, transparent 20%, ${shimmerColor} 50%, transparent 80%)`,
          backgroundSize: '200% 100%',
        }}
        aria-hidden="true"
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}
