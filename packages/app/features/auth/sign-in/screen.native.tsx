// packages/app/features/auth/sign-in/screen.native.tsx
import React, { useMemo } from 'react'
import { useSignIn as useClerkSignInNative } from '@clerk/clerk-expo'
import { SignInForm, ClerkSignInProps } from './form' // Adjust path if needed
import { useSearchParams } from 'solito/navigation'

export default function SignInScreen() {
  // Keep consistent export for Solito if needed
  const clerkSignInHookOutput = useClerkSignInNative() || {
    isLoaded: false,
    signIn: undefined,
    setActive: async () => {},
  }
  const searchParams = useSearchParams()

  const initialEmail = useMemo(() => {
    if (searchParams && typeof searchParams.get === 'function') {
      return searchParams.get('email')
    }
    return null
  }, [searchParams])

  // Cast or map to the ClerkSignInProps interface if types differ slightly
  const clerkProps: ClerkSignInProps = {
    isLoaded: clerkSignInHookOutput.isLoaded,
    signIn: clerkSignInHookOutput.signIn,
    setActive: clerkSignInHookOutput.setActive,
  }

  return <SignInForm clerkSignIn={clerkProps} initialEmail={initialEmail} />
}