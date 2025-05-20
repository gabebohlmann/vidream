// packages/app/features/auth/sign-in-form.tsx
import React, { useState } from 'react';
import { FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack, Button } from '@my/ui';
import { SchemaForm, formFields } from 'app/utils/SchemaForm';
import { FormProvider, useForm, useFormContext, Controller } from 'react-hook-form'; // Added Controller
import { Link } from 'solito/link';
import { useRouter } from 'solito/navigation';
import { z } from 'zod';

// Define the Zod schema once for the shared view
const SignInSchema = z.object({
  email: formFields.text.email().describe('Email // Enter your email'),
  password: formFields.text.min(6).describe('Password // Enter your password'),
});
type SignInFormData = z.infer<typeof SignInSchema>;

// Define an interface for the props expected from the Clerk useSignIn hook
// This acts as a contract. Ensure the core functionalities you use are covered.
// You might need to import actual types from @clerk/types if they are compatible enough
// or define a simplified interface like this:
export interface ClerkSignInProps {
  isLoaded: boolean;
  signIn: {
    create: (params: { identifier: string; password?: string; [key: string]: any }) => Promise<any>; // Adjust 'any' to actual Clerk result type
    [key: string]: any; // For other signIn methods if needed
  } | undefined;
  setActive: (params: { session: string | null; [key: string]: any }) => Promise<void>;
}

interface SignInViewProps {
  clerkSignIn: ClerkSignInProps; // The object containing Clerk's useSignIn output
  initialEmail?: string | null;
  // You could also pass down platform-specific links/components if truly needed
  // signUpLinkComponent?: React.ReactNode;
  // forgotPasswordLinkComponent?: React.ReactNode;
}

// Shared ForgotPasswordLink (can be part of SignInView or imported)
const ForgotPasswordLink = () => {
  const { watch } = useFormContext<SignInFormData>();
  const email = watch('email');
  const queryParams = new URLSearchParams();
  if (email) {
    queryParams.set('email', email);
  }
  const href = `/reset-password${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return (
    <Link href={href}>
      <Paragraph mt="$2" theme="alt2" textDecorationLine="underline" color="$colorFocus" accessibilityRole="link" textAlign="right">
        Forgot your password?
      </Paragraph>
    </Link>
  );
};

export const SignInForm: React.FC<SignInViewProps> = ({ clerkSignIn, initialEmail }) => {
  const router = useRouter();
  const [uiError, setUiError] = useState<string | null>(null);

  const { isLoaded, signIn, setActive } = clerkSignIn;

  const form = useForm<SignInFormData>({
    defaultValues: {
      email: initialEmail || '',
      password: '',
    },
  });

  async function handleSignInSubmit(data: SignInFormData) {
    console.log('[SignInView] handleSignInSubmit CALLED with data:', data);

    if (!isLoaded || !signIn || !signIn.create || !setActive) {
      console.error('[SignInView] Clerk useSignIn not ready or available.', { isLoaded, hasSignInCreate: !!(signIn && signIn.create), hasSetActive: !!setActive });
      setUiError("Clerk's sign-in service is not ready. Please wait a moment and try again.");
      return;
    }
    setUiError(null);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        console.error('[SignInView] Clerk Sign In status not complete:', JSON.stringify(result, null, 2));
        setUiError('Sign-in requires additional steps or has failed. Status: ' + result.status);
      }
    } catch (err: any) {
      console.error('[SignInView] Clerk Sign In Error:', JSON.stringify(err, null, 2));
      const defaultMessage = 'An error occurred during sign in. Please try again.';
      const clerkErrorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage;
      setUiError(clerkErrorMessage);
      // You might want to set form-specific errors here too using form.setError()
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
              <Theme inverse>
                <SubmitButton
                  onPress={() => {
                    if (!isLoaded) {
                      setUiError("Still loading. Please wait.");
                      return;
                    }
                    submit();
                  }}
                  br="$10"
                  disabled={!isLoaded || form.formState.isSubmitting}
                >
                  <Text>{isLoaded ? (form.formState.isSubmitting ? 'Signing In...' : 'Sign In') : 'Loading...'}</Text>
                </SubmitButton>
              </Theme>
              <Link href="/sign-up" passHref>
                <Paragraph ta="center" mt="$2" theme="alt1" textDecorationLine="underline" accessibilityRole="link">
                  Don&apos;t have an account? <Text>Sign up</Text>
                </Paragraph>
              </Link>
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
  );
};