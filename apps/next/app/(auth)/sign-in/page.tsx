// apps/next/app/(auth)/sign-in/page.tsx
// import { AuthLayout } from 'app/features/auth/layout.web'
import SignInScreen from 'app/features/auth/sign-in/screen.web'
import { Suspense } from 'react'

export const metadata = {
  title: 'Sign In',
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInScreen />
    </Suspense>
  )
}
