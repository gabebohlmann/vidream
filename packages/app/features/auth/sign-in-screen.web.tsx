// packages/app/features/auth/sign-in-screen.web.tsx
'use client' // Important for Next.js App Router

import { FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack, Button } from '@my/ui'
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Link } from 'solito/link'
import { useRouter, useSearchParams, useUpdateSearchParams } from 'solito/navigation'
import { z } from 'zod'
import { useSignIn } from '@clerk/nextjs' // For Next.js web

const SignInSchema = z.object({
  email: formFields.text.email().describe('Email // Enter your email'),
  password: formFields.text.min(6).describe('Password // Enter your password'),
})

export const SignInScreen = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()

  const { signIn, setActive, isLoaded } = useSignIn() || {}; // Destructure from Clerk
  const [clerkError, setClerkError] = useState<string | null>(null);

  const emailFromQuery = useMemo(() => {
    if (!searchParams || typeof searchParams.get !== 'function') return undefined;
    return searchParams.get('email');
  }, [searchParams]);

  useEffect(() => {
    if (emailFromQuery) {
      updateSearchParams({ email: undefined }, { web: { replace: true } });
    }
  }, [emailFromQuery, updateSearchParams]);

  const form = useForm<z.infer<typeof SignInSchema>>()

  async function handleSignIn({ email, password }: z.infer<typeof SignInSchema>) {
    if (!isLoaded || !signIn || !setActive) {
      setClerkError("Clerk is not ready. Please try again.");
      return;
    }
    setClerkError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/'); // Redirect to home page
      } else {
        // Handle other statuses like MFA if needed
        console.error('Clerk Sign In Status Not Complete:', JSON.stringify(result, null, 2));
        setClerkError('Sign in requires additional steps or failed.');
        // You might need to navigate to a different screen for MFA based on `result.nextFactor`
      }
    } catch (err: any) {
      console.error('Clerk Sign In Error:', JSON.stringify(err, null, 2));
      const defaultMessage = 'An error occurred during sign in. Please try again.';
      const clerkErrorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage;
      setClerkError(clerkErrorMessage);
      if (clerkErrorMessage.toLowerCase().includes('email') || clerkErrorMessage.toLowerCase().includes('identifier')) {
        form.setError('email', { type: 'custom', message: clerkErrorMessage });
      } else if (clerkErrorMessage.toLowerCase().includes('password')) {
        form.setError('password', { type: 'custom', message: clerkErrorMessage });
      } else {
         form.setError('password', { type: 'custom', message: clerkErrorMessage }); // Fallback
      }
    }
  }

  return (
    <FormWrapper>
      <FormProvider {...form}>
        <SchemaForm
          form={form}
          schema={SignInSchema}
          defaultValues={{
            email: emailFromQuery || '',
            password: '',
          }}
          onSubmit={handleSignIn}
          props={{
            password: {
              afterElement: <ForgotPasswordLink />,
              secureTextEntry: true,
            },
          }}
          renderAfter={({ submit }) => (
            <>
              {clerkError && (
                <Paragraph color="$red10" my="$2" ta="center">
                  {clerkError}
                </Paragraph>
              )}
              <Theme inverse>
                <SubmitButton onPress={() => submit()} br="$10" disabled={!isLoaded}>
                  {isLoaded ? 'Sign In' : 'Loading...'}
                </SubmitButton>
              </Theme>
              <SignInScreenSignUpLink />
            </>
          )}
        >
          {(fields) => (
            <YStack p="$4" space="$4" backgroundColor="$background">
              <YStack gap="$3" mb="$4">
                <H2 $sm={{ size: '$8' }} color="$color">Welcome Back</H2>
                <Paragraph theme="alt1" color="$colorFocus">Sign in to your account</Paragraph>
              </YStack>
              {Object.values(fields)}
            </YStack>
          )}
        </SchemaForm>
      </FormProvider>
    </FormWrapper>
  )
}

const SignInScreenSignUpLink = () => {
  const router = useRouter();
  return (
    <Button variant="outlined" onPress={() => router.push('/sign-up')} mt="$2">
      <Paragraph ta="center" theme="alt1">
        Don&apos;t have an account? <Text textDecorationLine="underline">Sign up</Text>
      </Paragraph>
    </Button>
  );
}

const ForgotPasswordLink = () => {
  const { watch } = useFormContext<z.infer<typeof SignInSchema>>();
  const email = watch('email');
  const queryParams = new URLSearchParams();
  if (email) queryParams.set('email', email);
  const href = `/reset-password${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return (
    <Link href={href}>
      <Paragraph mt="$1" theme="alt2" textDecorationLine="underline" color="$colorFocus">
        Forgot your password?
      </Paragraph>
    </Link>
  );
}