// Library: Magic UI
// Path: components/magic/DotPattern.tsx
'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface DotPatternProps {
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
}

export function DotPattern({
  width = 16,
  height = 16,
  cx = 8,
  cy = 8,
  cr = 1,
  className,
}: DotPatternProps) {
  const id = useId()
  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}
