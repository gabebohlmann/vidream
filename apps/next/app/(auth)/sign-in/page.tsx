// apps/next/app/(auth)/sign-in/page.tsx
// import { AuthLayout } from 'app/features/auth/layout.web'
import SignInScreen from 'app/features/auth/sign-in/screen.web'

export const metadata = {
  title: 'Sign In',
}

export default function SignInPage() {
  return (
    <>
      <SignInScreen />
    </>
  )
}
