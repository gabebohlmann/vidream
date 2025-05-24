// packages/app/features/auth/reset-password/screen.web.tsx
'use client'
import React, { Suspense, useMemo } from 'react'
import { useSignIn as useClerkSignInWeb } from '@clerk/nextjs'
import { ResetPasswordForm, type ClerkResetPasswordProps } from './form'
import { useSearchParams } from 'solito/navigation'

export default function ResetPasswordScreenWebWrapper() {
  const clerkSignInHookOutput = useClerkSignInWeb() || {
    isLoaded: false,
    signIn: undefined,
    setActive: async () => console.warn('Clerk setActive not available'),
  }
  const searchParams = useSearchParams()

  const initialEmail = useMemo(() => {
    if (searchParams && typeof searchParams.get === 'function') {
      return searchParams.get('email')
    }
    return null
  }, [searchParams])

  // No need for updateSearchParams for this form, initialEmail is just a prefill

  const clerkProps: ClerkResetPasswordProps = {
    isLoaded: clerkSignInHookOutput.isLoaded,
    signIn: clerkSignInHookOutput.signIn as ClerkResetPasswordProps['signIn'],
    setActive: clerkSignInHookOutput.setActive as ClerkResetPasswordProps['setActive'],
  }

  return <ResetPasswordForm clerkResetPassword={clerkProps} initialEmail={initialEmail} />
}
