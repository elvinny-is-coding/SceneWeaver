import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: 'Sign in — SceneWeaver' }

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Sign in</h2>
      <LoginForm />
    </>
  )
}
