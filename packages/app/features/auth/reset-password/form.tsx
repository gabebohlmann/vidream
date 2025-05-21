// packages/app/features/auth/reset-password/form.tsx
import React, { useState, useMemo, useEffect } from 'react'
import { FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack, Button } from '@my/ui'
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
import { FormProvider, useForm } from 'react-hook-form'
import { useRouter } from 'solito/navigation' // No Link needed here as no direct nav to other auth pages
import { z } from 'zod'
import { Platform } from 'react-native' // For potential minor UI tweaks

// Schemas
const EmailSchema = z.object({
  email: formFields.text.email().describe('Email // your@email.com'),
})
type EmailFormData = z.infer<typeof EmailSchema>

const ResetPasswordSchema = z.object({
  code: formFields.text.min(6).describe('Verification Code // Enter the code from your email'),
  password: formFields.text.min(8).describe('New Password // Choose a new password'),
})
type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

// Interface for props from Clerk's useSignIn hook (for password reset flow)
export interface ClerkResetPasswordProps {
  isLoaded: boolean
  signIn:
    | {
        create: (params: {
          strategy: string
          identifier: string
          [key: string]: any
        }) => Promise<any>
        attemptFirstFactor: (params: {
          strategy: string
          code: string
          password?: string
          [key: string]: any
        }) => Promise<any>
        [key: string]: any // For other signIn object methods if used
      }
    | undefined
  setActive: (params: { session: string | null; [key: string]: any }) => Promise<void>
}

interface ResetPasswordFormProps {
  clerkResetPassword: ClerkResetPasswordProps
  initialEmail?: string | null // Passed from platform-specific screen
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  clerkResetPassword,
  initialEmail,
}) => {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = clerkResetPassword

  const [pendingVerification, setPendingVerification] = useState(false)
  const [uiError, setUiError] = useState<string | null>(null)

  const emailForm = useForm<EmailFormData>({
    defaultValues: {
      email: initialEmail || '',
    },
  })
  // useEffect to update form if initialEmail changes (e.g. from query params after component mount)
  useEffect(() => {
    if (initialEmail) {
      emailForm.reset({ email: initialEmail })
    }
  }, [initialEmail, emailForm])

  const resetForm = useForm<ResetPasswordFormData>()

  async function handleSendCodeSubmit(data: EmailFormData) {
    if (!isLoaded || !signIn || !signIn.create) {
      setUiError('Password reset service is not ready. Please try again.')
      return
    }
    setUiError(null)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: data.email,
      })
      setPendingVerification(true)
    } catch (err: any) {
      console.error('[ResetPasswordForm] Clerk Send Code Error:', JSON.stringify(err, null, 2))
      const errorMessage = err.errors?.[0]?.longMessage || 'Failed to send verification code.'
      setUiError(errorMessage)
      emailForm.setError('email', { type: 'custom', message: errorMessage })
    }
  }

  async function handleResetPasswordSubmit(data: ResetPasswordFormData) {
    if (!isLoaded || !signIn || !signIn.attemptFirstFactor || !setActive) {
      setUiError('Password reset service is not ready. Please try again.')
      return
    }
    setUiError(null)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: data.code,
        password: data.password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        // Optionally, you could show a success message before redirecting
        // For now, directly redirecting to home (or sign-in page if preferred)
        router.replace('/')
      } else {
        console.error(
          '[ResetPasswordForm] Clerk Reset Password Status Not Complete:',
          JSON.stringify(result, null, 2)
        )
        setUiError('Password reset requires additional steps or failed. Status: ' + result.status)
      }
    } catch (err: any) {
      console.error('[ResetPasswordForm] Clerk Reset Password Error:', JSON.stringify(err, null, 2))
      const errorMessage = err.errors?.[0]?.longMessage || 'Invalid code or password issue.'
      setUiError(errorMessage)
      resetForm.setError('code', { type: 'custom', message: errorMessage }) // Or set on 'password' if more relevant
    }
  }

  if (!isLoaded && !signIn) {
    return (
      <YStack fullscreen jc="center" ai="center" p="$4">
        <Paragraph>Loading...</Paragraph>
      </YStack>
    )
  }

  // Stage 1: Email Input Form
  if (!pendingVerification) {
    return (
      <FormWrapper>
        <FormProvider {...emailForm}>
          <SchemaForm
            form={emailForm}
            schema={EmailSchema}
            onSubmit={handleSendCodeSubmit}
            props={{
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
                <Button
                  onPress={() => router.push('/')}
                  br="$10" // Consistent border radius with SubmitButton
                  mt="$2" // Add some margin top for spacing
                  // You might want to use a different theme or style for a cancel button
                  // For example, an outline button or a less prominent style:
                  variant="outlined" // Assuming your Button component supports variants
                  // or apply direct styles:
                  // boc="$borderColor" // border color
                  // bg="$background"
                >
                  <Text>Cancel</Text>
                </Button>
                <SubmitButton
                  onPress={() => submit()}
                  br="$10"
                  disabled={!isLoaded || emailForm.formState.isSubmitting}
                  themeInverse
                >
                  {emailForm.formState.isSubmitting ? 'Sending...' : 'Send Verification Code'}
                  
                </SubmitButton>
              </>
            )}
          >
            {(fields) => (
              <YStack p="$4" space="$4" backgroundColor="$background">
                <YStack gap="$3" mb="$4">
                  <H2 $sm={{ size: '$8' }} color="$color">
                    Reset Password
                  </H2>
                  <Paragraph theme="alt1" color="$colorFocus">
                    Enter your email address and we'll send you a code to reset your password.
                  </Paragraph>
                </YStack>
                {Object.values(fields)}
              </YStack>
            )}
          </SchemaForm>
        </FormProvider>
      </FormWrapper>
    )
  }

  // Stage 2: Code and New Password Form
  return (
    <FormWrapper>
      <FormProvider {...resetForm}>
        <SchemaForm
          form={resetForm}
          schema={ResetPasswordSchema}
          onSubmit={handleResetPasswordSubmit}
          props={{
            code: {
              textContentType: 'oneTimeCode',
              autoComplete: 'one-time-code',
              keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric',
            },
            password: {
              secureTextEntry: true,
              textContentType: 'newPassword',
              autoComplete: 'new-password',
            },
          }}
          renderAfter={({ submit }) => (
            <>
              {uiError && (
                <Paragraph color="$red10" my="$2" ta="center">
                  {uiError}
                </Paragraph>
              )}
              <Button
                onPress={() => router.push('/')}
                br="$10" // Consistent border radius with SubmitButton
                mt="$2" // Add some margin top for spacing
                // You might want to use a different theme or style for a cancel button
                // For example, an outline button or a less prominent style:
                variant="outlined" // Assuming your Button component supports variants
                // or apply direct styles:
                // boc="$borderColor" // border color
                // bg="$background"
              >
                <Text>Cancel</Text>
              </Button>
              <Theme inverse>
                <SubmitButton
                  onPress={() => submit()}
                  br="$10"
                  disabled={!isLoaded || resetForm.formState.isSubmitting}
                >
                  {resetForm.formState.isSubmitting ? 'Resetting...' : 'Set New Password'}
                </SubmitButton>
              </Theme>
            </>
          )}
        >
          {(fields) => (
            <YStack p="$4" space="$4" backgroundColor="$background">
              <YStack gap="$3" mb="$4">
                <H2 $sm={{ size: '$8' }} color="$color">
                  Enter Code & New Password
                </H2>
                <Paragraph theme="alt1" color="$colorFocus">
                  Check your email for the verification code and enter it below along with your new
                  password.
                </Paragraph>
              </YStack>
              {Object.values(fields)}
              <Button
                theme="alt1"
                onPress={() => {
                  setPendingVerification(false)
                  setUiError(null)
                  // Do not reset emailForm here as it holds the email to possibly re-send
                }}
                mt="$2" // Spacing if needed
              >
                Back to email input
              </Button>
            </YStack>
          )}
        </SchemaForm>
      </FormProvider>
    </FormWrapper>
  )
}
