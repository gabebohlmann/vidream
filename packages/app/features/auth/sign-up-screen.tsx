// packages/app/features/auth/sign-up-screen.tsx
'use client'

import {
  Button,
  FormWrapper,
  H2,
  Paragraph,
  SubmitButton,
  Text,
  Theme,
  YStack,
  Input, // Assuming you have an Input component in @my/ui
  Label, // Assuming you have a Label component
} from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
import { useEffect, useMemo, useState } from 'react' // Added useState
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { Link } from 'solito/link'
import { z } from 'zod'
import { useRouter } from 'solito/navigation' // Keep Solito's router for navigation
import { Platform } from 'react-native' // To conditionally import Clerk hooks

// Conditional Clerk imports
let useSignUpClerk
if (Platform.OS === 'web') {
  // Ensure you have @clerk/clerk-react installed for web
  // Or if your web setup uses @clerk/nextjs for hooks, adjust accordingly
  import('@clerk/clerk-react').then((clerk) => {
    useSignUpClerk = clerk.useSignUp
  })
} else {
  import('@clerk/clerk-expo').then((clerk) => {
    useSignUpClerk = clerk.useSignUp
  })
}

// Define your Zod schema for the initial sign-up form
const SignUpSchema = z.object({
  email: formFields.text.email().describe('Email // your@email.acme'),
  password: formFields.text.min(6).describe('Password // Choose a password'),
})

// Schema for the verification code
const VerificationCodeSchema = z.object({
  code: formFields.text.min(6).max(6).describe('Verification Code // Enter the 6-digit code'),
})

export const SignUpScreen = () => {
  const router = useRouter() // For navigation after sign-up

  // Clerk's useSignUp hook
  const clerkSignUp = useSignUpClerk ? useSignUpClerk() : null
  const { isLoaded, signUp, setActive } = clerkSignUp || {}

  // State for Clerk's multi-step flow
  const [pendingVerification, setPendingVerification] = useState(false)
  const [clerkError, setClerkError] = useState<string | null>(null)

  // Form for initial email/password
  const form = useForm<z.infer<typeof SignUpSchema>>()
  // Form for verification code
  const verificationForm = useForm<z.infer<typeof VerificationCodeSchema>>()

  async function handleSignUp(data: z.infer<typeof SignUpSchema>) {
    if (!isLoaded || !signUp) {
      setClerkError('Clerk is not ready. Please try again.')
      return
    }
    setClerkError(null)

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      console.error('Clerk SignUp Error:', JSON.stringify(err, null, 2))
      const defaultMessage = 'An error occurred during sign up. Please try again.'
      const clerkErrorMessage =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage
      setClerkError(clerkErrorMessage)
      if (clerkErrorMessage.toLowerCase().includes('email')) {
        form.setError('email', { type: 'custom', message: clerkErrorMessage })
      } else if (clerkErrorMessage.toLowerCase().includes('password')) {
        form.setError('password', { type: 'custom', message: clerkErrorMessage })
      }
    }
  }

  async function handleVerifyCode(data: z.infer<typeof VerificationCodeSchema>) {
    if (!isLoaded || !signUp || !setActive) {
      setClerkError('Clerk is not ready. Please try again.')
      return
    }
    setClerkError(null)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.replace('/')
      } else {
        console.error(
          'Clerk Verification Status Not Complete:',
          JSON.stringify(completeSignUp, null, 2)
        )
        setClerkError('Verification not complete. Please check the console or try again.')
      }
    } catch (err: any) {
      // Corrected: Added opening curly brace
      console.error('Clerk Verification Error:', JSON.stringify(err, null, 2))
      const defaultMessage = 'Invalid verification code. Please try again.'
      const clerkErrorMessage =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage
      setClerkError(clerkErrorMessage)
      verificationForm.setError('code', { type: 'custom', message: clerkErrorMessage })
    }
  }

  if (!useSignUpClerk) {
    return (
      // Attempting to disable animation on this YStack
      <YStack fullscreen jc="center" ai="center" p="$4" animation={null}>
        <Paragraph>Loading authentication...</Paragraph>
      </YStack>
    )
  }

  if (pendingVerification) {
    return (
      <FormProvider {...verificationForm}>
        <FormWrapper>
          <FormWrapper.Body>
            {/* Attempting to disable animation on this YStack */}
            <YStack p="$4" space="$4" backgroundColor="$background" animation={null}>
              <H2 color="$color">Verify Your Email</H2>
              <Paragraph theme="alt1" color="$colorFocus">
                We've sent a verification code to your email address. Please enter it below.
              </Paragraph>
              {clerkError && <Paragraph color="$red10">{clerkError}</Paragraph>}
              <SchemaForm
                form={verificationForm}
                schema={VerificationCodeSchema}
                onSubmit={handleVerifyCode}
                renderAfter={({ submit }) => (
                  <Theme inverse>
                    <SubmitButton onPress={() => submit()} br="$10" animation={null}>
                      Verify Code
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
                setClerkError(null)
                form.reset()
                router.replace('/')
              }}
              icon={ChevronLeft}
              animation={null} // Attempting to disable animation
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
            onSubmit={handleSignUp}
            props={{
              password: {
                secureTextEntry: true,
              },
            }}
            renderAfter={({ submit }) => (
              <>
                {clerkError && (
                  <Paragraph color="$red10" mb="$2" ta="center">
                    {clerkError}
                  </Paragraph>
                )}
                <Theme inverse>
                  <SubmitButton
                    onPress={() => submit()}
                    br="$10"
                    disabled={!isLoaded}
                    animation={null}
                  >
                    {isLoaded ? 'Sign Up' : 'Loading...'}
                  </SubmitButton>
                </Theme>
                <SignUpScreenSignInLink />
              </>
            )}
          >
            {(fields) => (
              // Attempting to disable animation on this YStack
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

const SignUpScreenSignInLink = () => {
  const { watch } = useFormContext<z.infer<typeof SignUpSchema>>()
  const email = watch('email')

  const queryParams = new URLSearchParams()
  if (email) {
    queryParams.set('email', email)
  }
  const href = `/sign-in${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return (
    <Link href={href}>
      <Paragraph ta="center" theme="alt1" mt="$2" color="$colorFocus">
        Already signed up?{' '}
        <Text textDecorationLine="underline" color="$colorPress">
          Sign in
        </Text>
      </Paragraph>
    </Link>
  )
}

/*
const CheckYourEmail = () => {
  // ...
};
*/
