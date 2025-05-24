// apps/next/app/(auth)/reset-password/page.tsx
import ResetPasswordScreen from 'app/features/auth/reset-password/screen.web'
import { Suspense } from 'react'

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  )
}
