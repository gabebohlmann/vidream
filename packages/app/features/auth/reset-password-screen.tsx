// packages/app/features/auth/reset-password-screen.tsx
'use client'

import { Button, FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
// import { useSupabase } from 'app/utils/supabase/useSupabase';
import { useEffect, useMemo } from 'react' // Added useMemo
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
// Removed: import { createParam } from 'solito';
import { Link } from 'solito/link'
import { z } from 'zod'

// Import new hooks from solito/navigation
import { useSearchParams, useUpdateSearchParams, useRouter } from 'solito/navigation'

// Removed: const { useParams, useUpdateParams } = createParam<{ email?: string }>();

const ResetPasswordSchema = z.object({
  email: formFields.text.email().describe('Email // your@email.acme'),
})

export const ResetPasswordScreen = () => {
  // const supabase = useSupabase();
  // const router = useRouter(); // From solito/navigation, uncomment if needed for navigation logic
  const searchParams = useSearchParams() // From solito/navigation
  const updateSearchParams = useUpdateSearchParams() // From solito/navigation

  const emailFromQuery = useMemo(() => {
    if (!searchParams || typeof searchParams.get !== 'function') {
      return undefined
    }
    return searchParams.get('email')
  }, [searchParams])

  useEffect(() => {
    if (emailFromQuery) {
      // Use updateSearchParams from solito/navigation
      // The option { web: { replace: true } } might simplify to just { replace: true }
      // as solito/navigation hooks aim to abstract platform differences.
      // Check Solito's documentation if unsure, but { replace: true } is common.
      updateSearchParams({ email: undefined }, { replace: true })
    }
  }, [emailFromQuery, updateSearchParams])

  const form = useForm<z.infer<typeof ResetPasswordSchema>>()

  async function resetPassword({ email }: z.infer<typeof ResetPasswordSchema>) {
    console.log('Attempting to reset password for:', email)
    // const { error } = await supabase.auth.resetPasswordForEmail(email);
    // if (error) {
    //   const errorMessage = (error as any)?.message.toLowerCase();
    //   if (errorMessage.includes('email')) {
    //     form.setError('email', { type: 'custom', message: errorMessage });
    //   } else {
    //     // Fallback to setting error on 'email' field or a general form error
    //     form.setError('email', { type: 'custom', message: errorMessage });
    //   }
    // } else {
    //   // isSubmitSuccessful will trigger CheckYourEmail render
    // }
  }

  return (
    // Added Theme wrapper for web visibility, similar to other screens.
    // Ensure your global theme in styles-provider.tsx is the primary solution.
    <Theme name="dark">
      <FormProvider {...form}>
        {form.formState.isSubmitSuccessful ? (
          <CheckYourEmail />
        ) : (
          <SchemaForm
            form={form}
            schema={ResetPasswordSchema}
            defaultValues={{
              email: emailFromQuery || '', // Use email from useSearchParams
            }}
            onSubmit={resetPassword}
            renderAfter={({ submit }) => {
              return (
                <>
                  <Theme inverse>
                    <SubmitButton onPress={() => submit()} br="$10">
                      Send Link
                    </SubmitButton>
                  </Theme>
                  <ResetPasswordScreenSignInLink /> {/* Renamed for clarity */}
                </>
              )
            }}
          >
            {(fields) => (
              <YStack p="$4" space="$4" backgroundColor="$background">
                <YStack gap="$3" mb="$4">
                  <H2 $sm={{ size: '$8' }} color="$color">
                    Reset your password
                  </H2>
                  <Paragraph theme="alt1" color="$colorFocus">
                    Type in your email and we&apos;ll send you a link to reset your password
                  </Paragraph>
                </YStack>
                {Object.values(fields)}
              </YStack>
            )}
          </SchemaForm>
        )}
      </FormProvider>
    </Theme>
  )
}

const CheckYourEmail = () => {
  const { getValues, reset } = useFormContext<z.infer<typeof ResetPasswordSchema>>()
  const email = getValues('email')

  return (
    <FormWrapper>
      <FormWrapper.Body>
        <YStack gap="$3" p="$4" ai="center">
          <H2 color="$color">Check Your Email</H2>
          <Paragraph theme="alt1" color="$colorFocus" ta="center">
            We&apos;ve sent you a reset link. Please check your email ({email}) and follow the
            instructions.
          </Paragraph>
        </YStack>
      </FormWrapper.Body>
      <FormWrapper.Footer>
        <Button themeInverse icon={ChevronLeft} br="$10" onPress={() => reset()}>
          Back
        </Button>
      </FormWrapper.Footer>
    </FormWrapper>
  )
}

const ResetPasswordScreenSignInLink = () => {
  // Renamed for clarity
  const { watch } = useFormContext<z.infer<typeof ResetPasswordSchema>>()
  const email = watch('email') // Email from the reset password form

  const queryParams = new URLSearchParams()
  if (email) {
    // Only add email to link if it's present in the form
    queryParams.set('email', email)
  }
  const href = `/sign-in${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return (
    <Link href={href}>
      <Paragraph ta="center" theme="alt1" mt="$2" color="$colorFocus">
        Done resetting?{' '}
        <Text textDecorationLine="underline" color="$colorPress">
          Sign in
        </Text>
      </Paragraph>
    </Link>
  )
}
