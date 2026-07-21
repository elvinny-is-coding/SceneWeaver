// Library: shadcn/ui
// Path: app/(auth)/layout.tsx

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">SceneWeaver</CardTitle>
            <CardDescription>AI-powered visual storyboarding</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
