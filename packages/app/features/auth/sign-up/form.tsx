// packages/app/features/auth/sign-up/form.tsx
import React, { useState } from 'react'
import { FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack, Button } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons' // For native-like back button
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation'
import { z } from 'zod'
import { Platform } from 'react-native' // For minor platform-specific UI tweaks if needed

// Schemas (can be defined here or imported if used elsewhere)
const SignUpSchema = z.object({
  email: formFields.text.email().describe('Email // your@email.acme'),
  password: formFields.text.min(6).describe('Password // Choose a password'),
})
type SignUpFormData = z.infer<typeof SignUpSchema>

const VerificationCodeSchema = z.object({
  code: formFields.text.min(6).max(6).describe('Verification Code // Enter the 6-digit code'),
})
type VerificationCodeFormData = z.infer<typeof VerificationCodeSchema>

// Interface for props from Clerk's useSignUp hook
// Import specific types from @clerk/types if you want more precision
export interface ClerkSignUpProps {
  isLoaded: boolean
  signUp:
    | {
        create: (params: {
          emailAddress: string
          password?: string
          [key: string]: any
        }) => Promise<any>
        prepareEmailAddressVerification: (params: {
          strategy: string
          [key: string]: any
        }) => Promise<any>
        attemptEmailAddressVerification: (params: {
          code: string
          [key: string]: any
        }) => Promise<any>
        [key: string]: any // For other signUp object methods if used
      }
    | undefined
  setActive: (params: {
    session: string | null
    beforeEmit?: () => void
    [key: string]: any
  }) => Promise<void>
}

interface SignUpFormProps {
  clerkSignUp: ClerkSignUpProps
}

const SignUpScreenSignInLink = () => {
  // This link is generic and doesn't strictly need form context here
  // but keeping it for consistency if you later want to pass email from this form.
  // const { watch } = useFormContext<SignUpFormData>() // If you need to watch form values
  // const email = watch('email')
  const queryParams = new URLSearchParams()
  // if (email) queryParams.set('email', email); // Example
  const href = `/(auth)/sign-in${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return (
    <Link href={href}>
      <Paragraph ta="center" theme="alt1" mt="$2" color="$colorFocus" accessibilityRole="link">
        Already signed up?{' '}
        <Text textDecorationLine="underline" color="$colorPress">
          Sign in
        </Text>
      </Paragraph>
    </Link>
  )
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ clerkSignUp }) => {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = clerkSignUp

  const [pendingVerification, setPendingVerification] = useState(false)
  const [uiError, setUiError] = useState<string | null>(null)

  const form = useForm<SignUpFormData>()
  const verificationForm = useForm<VerificationCodeFormData>()

  async function handleSignUpSubmit(data: SignUpFormData) {
    if (!isLoaded || !signUp || !signUp.create || !signUp.prepareEmailAddressVerification) {
      setUiError('Clerk is not ready. Please try again.')
      return
    }
    setUiError(null)

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      console.error('[SignUpForm] Clerk SignUp Error:', JSON.stringify(err, null, 2))
      const defaultMessage = 'An error occurred during sign up. Please try again.'
      const clerkErrorMessage =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage
      setUiError(clerkErrorMessage)
      if (clerkErrorMessage.toLowerCase().includes('email')) {
        form.setError('email', { type: 'custom', message: clerkErrorMessage })
      } else if (clerkErrorMessage.toLowerCase().includes('password')) {
        form.setError('password', { type: 'custom', message: clerkErrorMessage })
      }
    }
  }

  async function handleVerifyCodeSubmit(data: VerificationCodeFormData) {
    if (!isLoaded || !signUp || !signUp.attemptEmailAddressVerification || !setActive) {
      setUiError('Clerk is not ready for verification. Please try again.')
      return
    }
    setUiError(null)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.replace('/') // Navigate to home or dashboard
      } else {
        console.error(
          '[SignUpForm] Clerk Verification Status Not Complete:',
          JSON.stringify(completeSignUp, null, 2)
        )
        setUiError('Verification not complete. Please try again or check the code.')
      }
    } catch (err: any) {
      console.error('[SignUpForm] Clerk Verification Error:', JSON.stringify(err, null, 2))
      const defaultMessage = 'Invalid verification code. Please try again.'
      const clerkErrorMessage =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage
      setUiError(clerkErrorMessage)
      verificationForm.setError('code', { type: 'custom', message: clerkErrorMessage })
    }
  }

  if (!isLoaded && !signUp) {
    // Initial loading state before Clerk hook is fully ready
    return (
      <YStack fullscreen jc="center" ai="center" p="$4">
        <Paragraph>Loading authentication...</Paragraph>
      </YStack>
    )
  }

  if (pendingVerification) {
    return (
      <FormProvider {...verificationForm}>
        <FormWrapper>
          <FormWrapper.Body>
            <YStack p="$4" space="$4" backgroundColor="$background" animation={null}>
              <H2 color="$color">Verify Your Email</H2>
              <Paragraph theme="alt1" color="$colorFocus">
                We've sent a verification code to your email address. Please enter it below.
              </Paragraph>
              {uiError && (
                <Paragraph color="$red10" my="$2" ta="center">
                  {uiError}
                </Paragraph>
              )}
              <SchemaForm
                form={verificationForm}
                schema={VerificationCodeSchema}
                onSubmit={handleVerifyCodeSubmit}
                renderAfter={({ submit }) => (
                  <Theme inverse>
                    <SubmitButton
                      onPress={() => submit()}
                      br="$10"
                      animation={null}
                      disabled={!isLoaded || verificationForm.formState.isSubmitting}
                    >
                      {verificationForm.formState.isSubmitting ? 'Verifying...' : 'Verify Code'}
                    </SubmitButton>
                  </Theme>
                )}
              >
                {(fields) => <>{Object.values(fields)}</>}
              </SchemaForm>
            </YStack>
          </FormWrapper.Body>
          <FormWrapper.Footer>
            <Button
              theme="alt1"
              onPress={() => {
                setPendingVerification(false)
                setUiError(null)
                form.reset() // Reset the initial sign-up form if needed
                // Optionally navigate somewhere else or just show the first form
                // router.replace('/(auth)/sign-up'); // Or just let it re-render this component
              }}
              // Icon only for native for simplicity, web can use text
              icon={Platform.OS !== 'web' ? ChevronLeft : undefined}
              animation={null}
            >
              Back to Sign Up
            </Button>
          </FormWrapper.Footer>
        </FormWrapper>
      </FormProvider>
    )
  }

  return (
    <FormProvider {...form}>
      <FormWrapper>
        <FormWrapper.Body>
          <SchemaForm
            form={form}
            schema={SignUpSchema}
            onSubmit={handleSignUpSubmit}
            props={{
              password: {
                secureTextEntry: true,
                textContentType: 'newPassword', // For autofill
                autoComplete: 'new-password', // For autofill
              },
              email: {
                textContentType: 'emailAddress',
                autoComplete: 'email',
                keyboardType: 'email-address',
              },
            }}
            renderAfter={({ submit }) => (
              <>
                {uiError && (
                  <Paragraph color="$red10" my="$2" ta="center">
                    {uiError}
                  </Paragraph>
                )}
                <Theme inverse>
                  <SubmitButton
                    onPress={() => submit()}
                    br="$10"
                    disabled={!isLoaded || form.formState.isSubmitting}
                    animation={null}
                  >
                    {isLoaded
                      ? form.formState.isSubmitting
                        ? 'Signing Up...'
                        : 'Sign Up'
                      : 'Loading...'}
                  </SubmitButton>
                </Theme>
                <SignUpScreenSignInLink />
              </>
            )}
          >
            {(fields) => (
              <YStack p="$4" space="$4" backgroundColor="$background" animation={null}>
                <YStack gap="$3" mb="$4" animation={null}>
                  <H2 $sm={{ size: '$8' }} color="$color">
                    Get Started
                  </H2>
                  <Paragraph theme="alt2" color="$colorFocus">
                    Create a new account
                  </Paragraph>
                </YStack>
                {Object.values(fields)}
              </YStack>
            )}
          </SchemaForm>
        </FormWrapper.Body>
      </FormWrapper>
    </FormProvider>
  )
}
