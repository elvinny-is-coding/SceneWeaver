import { SignupForm } from '@/components/auth/SignupForm'

export const metadata = { title: 'Create account — SceneWeaver' }

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Create account</h2>
      <SignupForm />
    </>
  )
}
