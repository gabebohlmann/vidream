// packages/app/features/auth/sign-in/form.tsx
import React, { useState } from 'react'
import { FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack, Button } from '@my/ui' // Button is already imported
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
import { FormProvider, useForm, useFormContext, Controller } from 'react-hook-form'
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation'
import { z } from 'zod'

// Define the Zod schema once for the shared view
const SignInSchema = z.object({
  email: formFields.text.email().describe('Email // Enter your email'),
  password: formFields.text.min(6).describe('Password // Enter your password'),
})
type SignInFormData = z.infer<typeof SignInSchema>

export interface ClerkSignInProps {
  isLoaded: boolean
  signIn:
    | {
        create: (params: {
          identifier: string
          password?: string
          [key: string]: any
        }) => Promise<any>
        [key: string]: any
      }
    | undefined
  setActive: (params: { session: string | null; [key: string]: any }) => Promise<void>
}

interface SignInViewProps {
  clerkSignIn: ClerkSignInProps
  initialEmail?: string | null
}

const ForgotPasswordLink = () => {
  const { watch } = useFormContext<SignInFormData>()
  const email = watch('email')
  const queryParams = new URLSearchParams()
  if (email) {
    queryParams.set('email', email)
  }
  const href = `/reset-password${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return (
    <Link href={href}>
      <Paragraph
        mt="$2"
        theme="alt2"
        textDecorationLine="underline"
        color="$colorFocus"
        accessibilityRole="link"
        textAlign="right"
      >
        Forgot your password?
      </Paragraph>
    </Link>
  )
}

export const SignInForm: React.FC<SignInViewProps> = ({ clerkSignIn, initialEmail }) => {
  const router = useRouter()
  const [uiError, setUiError] = useState<string | null>(null)

  const { isLoaded, signIn, setActive } = clerkSignIn

  const form = useForm<SignInFormData>({
    defaultValues: {
      email: initialEmail || '',
      password: '',
    },
  })

  async function handleSignInSubmit(data: SignInFormData) {
    console.log('[SignInView] handleSignInSubmit CALLED with data:', data)

    if (!isLoaded || !signIn || !signIn.create || !setActive) {
      console.error('[SignInView] Clerk useSignIn not ready or available.', {
        isLoaded,
        hasSignInCreate: !!(signIn && signIn.create),
        hasSetActive: !!setActive,
      })
      setUiError("Clerk's sign-in service is not ready. Please wait a moment and try again.")
      return
    }
    setUiError(null)

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/') // Or router.push('/') depending on desired backstack behavior
      } else {
        console.error(
          '[SignInView] Clerk Sign In status not complete:',
          JSON.stringify(result, null, 2)
        )
        setUiError('Sign-in requires additional steps or has failed. Status: ' + result.status)
      }
    } catch (err: any) {
      console.error('[SignInView] Clerk Sign In Error:', JSON.stringify(err, null, 2))
      const defaultMessage = 'An error occurred during sign in. Please try again.'
      const clerkErrorMessage =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage
      setUiError(clerkErrorMessage)
    }
  }

  return (
    <FormWrapper>
      <FormProvider {...form}>
        <SchemaForm
          form={form}
          schema={SignInSchema}
          onSubmit={handleSignInSubmit}
          props={{
            email: {
              textContentType: 'emailAddress',
              autoComplete: 'email',
              keyboardType: 'email-address',
            },
            password: {
              secureTextEntry: true,
              textContentType: 'password',
              autoComplete: 'current-password',
              afterElement: <ForgotPasswordLink />,
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
                <Button
                  onPress={() => {
                    if (!isLoaded) {
                      setUiError('Still loading. Please wait.')
                      return
                    }
                    submit()
                  }}
                  br="$10" // You can also use theme tokens like $radius.lg
                disabled={!isLoaded || form.formState.isSubmitting}
                theme="gray" // Use your theme token for default button style
                // borderColor="$color"
                backgroundColor="$gray7"
                >
                  <Text>
                    {isLoaded
                      ? form.formState.isSubmitting
                        ? 'Signing In...'
                        : 'Sign In'
                      : 'Loading...'}
                  </Text>
                </Button>
              <Link href="/sign-up" passHref>
                <Paragraph
                  ta="center"
                  mt="$4"
                  theme="alt1"
                  textDecorationLine="underline"
                  accessibilityRole="link"
                >
                  Don&apos;t have an account? <Text>Sign up</Text>
                </Paragraph>
              </Link>
            </>
          )}
        >
          {(fields) => (
            <YStack p="$4" space="$4" backgroundColor="$background">
              <YStack gap="$3" mb="$4">
                <H2 $sm={{ size: '$8' }} color="$color">
                  Welcome Back
                </H2>
                <Paragraph theme="alt1" color="$colorFocus">
                  Sign in to your account
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
