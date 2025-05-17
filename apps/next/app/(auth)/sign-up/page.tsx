// apps/next/app/(auth)/sign-up/page.tsx
// import { AuthLayout } from 'app/features/auth/layout.web'
import { SignUpScreen } from 'app/features/auth/sign-up-screen'
// import Head from 'next/head'

export const metadata = {
  title: 'Sign Up',
}

export default function SignUpPage() {
  return (
    <>
      <SignUpScreen />
    </>
  )
}
