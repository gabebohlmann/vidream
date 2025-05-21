// packages/app/features/auth/reset-password-screen.native.tsx
'use client'

import { Button, FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack } from '@my/ui'
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
import { useState, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'solito/navigation'
import { z } from 'zod'
import { useSignIn } from '@clerk/clerk-expo'

const EmailSchema = z.object({
  email: formFields.text.email().describe('Email // your@email.com'),
})

const ResetPasswordSchema = z.object({
  code: formFields.text.min(6).describe('Verification Code // Enter the code from your email'),
  password: formFields.text.min(8).describe('New Password // Choose a new password'),
})

export const ResetPasswordScreen = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, setActive, isLoaded } = useSignIn() || {}

  const [pendingVerification, setPendingVerification] = useState(false)
  const [clerkError, setClerkError] = useState<string | null>(null)

  const initialEmail = useMemo(() => searchParams?.get('email') || '', [searchParams])

  const emailForm = useForm<z.infer<typeof EmailSchema>>()
  const resetForm = useForm<z.infer<typeof ResetPasswordSchema>>()

  async function handleSendCode({ email }: z.infer<typeof EmailSchema>) {
    if (!isLoaded || !signIn) return
    setClerkError(null)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setPendingVerification(true)
    } catch (err: any) {
      console.error('Clerk Send Code Error:', JSON.stringify(err, null, 2))
      const errorMessage = err.errors?.[0]?.longMessage || 'Failed to send verification code.'
      setClerkError(errorMessage)
      emailForm.setError('email', { type: 'custom', message: errorMessage })
    }
  }

  async function handleResetPassword({ code, password }: z.infer<typeof ResetPasswordSchema>) {
    if (!isLoaded || !signIn || !setActive) return
    setClerkError(null)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/') // Redirect to home
      } else {
        console.error('Clerk Reset Password Status Not Complete:', JSON.stringify(result, null, 2))
        setClerkError('Password reset requires additional steps or failed.')
      }
    } catch (err: any) {
      console.error('Clerk Reset Password Error:', JSON.stringify(err, null, 2))
      const errorMessage = err.errors?.[0]?.longMessage || 'Invalid code or password issue.'
      setClerkError(errorMessage)
      resetForm.setError('code', { type: 'custom', message: errorMessage })
    }
  }

  if (!pendingVerification) {
    return (
      <FormWrapper>
        <FormProvider {...emailForm}>
          <SchemaForm
            form={emailForm}
            schema={EmailSchema}
            defaultValues={{ email: initialEmail }}
            onSubmit={handleSendCode}
            renderAfter={({ submit }) => (
              <>
                {clerkError && (
                  <Paragraph color="$red10" my="$2">
                    {clerkError}
                  </Paragraph>
                )}
                <Theme inverse>
                  <SubmitButton onPress={() => submit()} disabled={!isLoaded}>
                    Send Verification Code
                  </SubmitButton>
                </Theme>
              </>
            )}
          >
            {(fields) => (
              <YStack p="$4" space="$4" backgroundColor="$background">
                <H2>Reset Password</H2>
                <Paragraph>Enter your email to receive a verification code.</Paragraph>
                {Object.values(fields)}
              </YStack>
            )}
          </SchemaForm>
        </FormProvider>
      </FormWrapper>
    )
  }

  return (
    <FormWrapper>
      <FormProvider {...resetForm}>
        <SchemaForm
          form={resetForm}
          schema={ResetPasswordSchema}
          onSubmit={handleResetPassword}
          renderAfter={({ submit }) => (
            <>
              {clerkError && (
                <Paragraph color="$red10" my="$2">
                  {clerkError}
                </Paragraph>
              )}
              <Theme inverse>
                <SubmitButton onPress={() => submit()} disabled={!isLoaded}>
                  Set New Password
                </SubmitButton>
              </Theme>
            </>
          )}
        >
          {(fields) => (
            <YStack p="$4" space="$4" backgroundColor="$background">
              <H2>Enter Code & New Password</H2>
              <Paragraph>Check your email for the verification code.</Paragraph>
              {Object.values(fields)}
              <Button
                theme="alt1"
                onPress={() => {
                  setPendingVerification(false)
                  setClerkError(null)
                }}
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