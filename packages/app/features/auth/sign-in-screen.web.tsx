// packages/app/features/auth/sign-in-screen.web.tsx
'use client' // If using Next.js App Router
import React, { useMemo, useEffect } from 'react'
import { useSignIn as useClerkSignInWeb } from '@clerk/nextjs' // Or @clerk/clerk-react
import { SignInForm, ClerkSignInProps } from './sign-in-form' // Adjust path
import { useSearchParams, useUpdateSearchParams } from 'solito/navigation'

export default function SignInScreen() {
  // Keep consistent export
  const clerkSignInHookOutput = useClerkSignInWeb() || {
    isLoaded: false,
    signIn: undefined,
    setActive: async () => {},
  }
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams() // Web specific for clearing param

  const initialEmail = useMemo(() => {
    if (searchParams && typeof searchParams.get === 'function') {
      return searchParams.get('email')
    }
    return null
  }, [searchParams])

  // Web-specific logic like clearing URL params can stay here
  useEffect(() => {
    if (initialEmail) {
      updateSearchParams({ email: undefined }, { web: { replace: true } })
    }
  }, [initialEmail, updateSearchParams])

  const clerkProps: ClerkSignInProps = {
    isLoaded: clerkSignInHookOutput.isLoaded,
    signIn: clerkSignInHookOutput.signIn,
    setActive: clerkSignInHookOutput.setActive,
  }

  return <SignInForm clerkSignIn={clerkProps} initialEmail={initialEmail} />
}