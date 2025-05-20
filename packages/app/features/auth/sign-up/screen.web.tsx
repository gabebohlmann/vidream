// packages/app/features/auth/sign-up/screen.web.tsx
'use client'
import React from 'react'
import { useSignUp as useClerkSignUpWeb } from '@clerk/nextjs' // Or @clerk/clerk-react if not Next.js page
import { SignUpForm, type ClerkSignUpProps } from './form' // Ensure correct path

export default function SignUpScreen() {
  // Provide default/empty functions if hook returns undefined initially or on error
  const { isLoaded, signUp, setActive } = useClerkSignUpWeb() || {
    isLoaded: false,
    signUp: undefined,
    setActive: async () => console.warn('Clerk setActive not available'),
  }

  const clerkProps: ClerkSignUpProps = {
    isLoaded,
    signUp: signUp as ClerkSignUpProps['signUp'],
    setActive: setActive as ClerkSignUpProps['setActive'],
  }

  return <SignUpForm clerkSignUp={clerkProps} />
}
