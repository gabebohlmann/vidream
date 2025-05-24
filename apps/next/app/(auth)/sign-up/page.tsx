// apps/next/app/(auth)/sign-up/page.tsx
import SignUpScreen from 'app/features/auth/sign-up/screen.web'

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
