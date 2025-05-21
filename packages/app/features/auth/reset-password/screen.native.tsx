// packages/app/features/auth/reset-password/screen.native.tsx
import React, { useMemo } from 'react'
import { useSignIn as useClerkSignInNative } from '@clerk/clerk-expo'
import { ResetPasswordForm, type ClerkResetPasswordProps } from './form'
import { useSearchParams } from 'solito/navigation'

export default function ResetPasswordScreenNativeWrapper() {
  const clerkSignInHookOutput = useClerkSignInNative() || {
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

  const clerkProps: ClerkResetPasswordProps = {
    isLoaded: clerkSignInHookOutput.isLoaded,
    signIn: clerkSignInHookOutput.signIn as ClerkResetPasswordProps['signIn'],
    setActive: clerkSignInHookOutput.setActive as ClerkResetPasswordProps['setActive'],
  }

  return <ResetPasswordForm clerkResetPassword={clerkProps} initialEmail={initialEmail} />
}
