// Library: Magic UI
// Path: components/magic/BentoGrid.tsx
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoCardProps {
  name: string
  description: string
  Icon: LucideIcon
  className?: string
}

export function BentoCard({ name, description, Icon, className }: BentoCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-transform duration-200',
        'motion-safe:hover:scale-[1.02]',
        className
      )}
    >
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
