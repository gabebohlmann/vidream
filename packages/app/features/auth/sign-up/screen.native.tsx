// packages/app/features/auth/sign-up/screen.native.tsx
import React from 'react'
import { useSignUp as useClerkSignUpNative } from '@clerk/clerk-expo'
import { SignUpForm, type ClerkSignUpProps } from './form' // Ensure correct path

export default function SignUpScreen() {
  // Provide default/empty functions if hook returns undefined initially or on error
  const { isLoaded, signUp, setActive } = useClerkSignUpNative() || {
    isLoaded: false,
    signUp: undefined,
    setActive: async () => console.warn('Clerk setActive not available'),
  }

  const clerkProps: ClerkSignUpProps = {
    isLoaded,
    signUp: signUp as ClerkSignUpProps['signUp'], // Cast if types are compatible but not identical
    setActive: setActive as ClerkSignUpProps['setActive'],
  }

  return <SignUpForm clerkSignUp={clerkProps} />
}
