// packages/app/features/auth/sign-up/form.tsx
import React, { useState } from 'react';
import { FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack, Button } from '@my/ui';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { SchemaForm, formFields } from 'app/utils/SchemaForm';
import { FormProvider, useForm } from 'react-hook-form'; // Removed useFormContext as it's not directly used at this top level
import { Link } from 'solito/link';
import { useRouter } from 'solito/navigation';
import { z } from 'zod';
import { Platform } from 'react-native';

// Schemas
const SignUpSchema = z.object({
  email: formFields.text.email().describe('Email // your@email.acme'),
  password: formFields.text.min(6).describe('Password // Choose a password'),
});
type SignUpFormData = z.infer<typeof SignUpSchema>;

const VerificationCodeSchema = z.object({
  code: formFields.text.min(6).max(6).describe('Verification Code // Enter the 6-digit code'),
});
type VerificationCodeFormData = z.infer<typeof VerificationCodeSchema>;

// Props Interface (ensure this is accurate for both Clerk SDKs)
export interface ClerkSignUpProps {
  isLoaded: boolean;
  signUp: {
    create: (params: { emailAddress: string; password?: string;[key: string]: any }) => Promise<any>;
    prepareEmailAddressVerification: (params: { strategy: string;[key: string]: any }) => Promise<any>;
    attemptEmailAddressVerification: (params: { code: string;[key: string]: any }) => Promise<any>;
    [key: string]: any;
  } | undefined;
  setActive: (params: { session: string | null; beforeEmit?: () => void;[key:string]: any }) => Promise<void>;
}

interface SignUpFormProps {
  clerkSignUp: ClerkSignUpProps;
}

// Link to Sign In page (Consistent with SignInForm's link structure)
const SignUpScreenSignInLink = () => {
  const href = `/(auth)/sign-in`;
  return (
    <Link href={href}>
      <Paragraph ta="center" theme="alt1" mt="$2" color="$colorFocus" accessibilityRole="link">
        Already signed up?{' '}
        <Text textDecorationLine="underline" color="$colorPress">
          Sign in
        </Text>
      </Paragraph>
    </Link>
  );
};

export const SignUpForm: React.FC<SignUpFormProps> = ({ clerkSignUp }) => {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = clerkSignUp;

  const [pendingVerification, setPendingVerification] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const initialSignUpForm = useForm<SignUpFormData>(); // Renamed for clarity
  const verificationCodeForm = useForm<VerificationCodeFormData>(); // Renamed for clarity

  async function handleSignUpSubmit(data: SignUpFormData) {
    if (!isLoaded || !signUp || !signUp.create || !signUp.prepareEmailAddressVerification) {
      setUiError('Clerk is not ready. Please try again.');
      return;
    }
    setUiError(null);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('[SignUpForm] Clerk SignUp Error:', JSON.stringify(err, null, 2));
      const defaultMessage = 'An error occurred during sign up. Please try again.';
      const clerkErrorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage;
      setUiError(clerkErrorMessage);
      if (clerkErrorMessage.toLowerCase().includes('email')) {
        initialSignUpForm.setError('email', { type: 'custom', message: clerkErrorMessage });
      } else if (clerkErrorMessage.toLowerCase().includes('password')) {
        initialSignUpForm.setError('password', { type: 'custom', message: clerkErrorMessage });
      }
    }
  }

  async function handleVerifyCodeSubmit(data: VerificationCodeFormData) {
    if (!isLoaded || !signUp || !signUp.attemptEmailAddressVerification || !setActive) {
      setUiError('Clerk is not ready for verification. Please try again.');
      return;
    }
    setUiError(null);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error('[SignUpForm] Clerk Verification Status Not Complete:', JSON.stringify(completeSignUp, null, 2));
        setUiError('Verification not complete. Please try again or check the code.');
      }
    } catch (err: any) {
      console.error('[SignUpForm] Clerk Verification Error:', JSON.stringify(err, null, 2));
      const defaultMessage = 'Invalid verification code. Please try again.';
      const clerkErrorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage;
      setUiError(clerkErrorMessage);
      verificationCodeForm.setError('code', { type: 'custom', message: clerkErrorMessage });
    }
  }

  if (!isLoaded && !signUp) {
    return (
      <YStack fullscreen jc="center" ai="center" p="$4">
        <Paragraph>Loading authentication...</Paragraph>
      </YStack>
    );
  }

  if (pendingVerification) {
    return (
      <FormWrapper>
        <FormProvider {...verificationCodeForm}>
          {/* This YStack now directly contains the header and SchemaForm, similar to SignInForm structure */}
          <YStack p="$4" space="$4" backgroundColor="$background">
            <YStack gap="$3" mb="$4"> {/* Header specific to verification */}
              <H2 $sm={{ size: '$8' }} color="$color">Verify Your Email</H2>
              <Paragraph theme="alt1" color="$colorFocus">
                We've sent a verification code to your email address. Please enter it below.
              </Paragraph>
            </YStack>
            
            {uiError && <Paragraph color="$red10" my="$2" ta="center">{uiError}</Paragraph>}

            <SchemaForm
              form={verificationCodeForm}
              schema={VerificationCodeSchema}
              onSubmit={handleVerifyCodeSubmit}
              props={{
                code: {
                  textContentType: 'oneTimeCode',
                  autoComplete: 'one-time-code',
                  keyboardType: 'number-pad',
                }
              }}
              renderAfter={({ submit }) => (
                <Theme inverse>
                  <SubmitButton onPress={() => submit()} br="$10" disabled={!isLoaded || verificationCodeForm.formState.isSubmitting}>
                    {verificationCodeForm.formState.isSubmitting ? "Verifying..." : "Verify Code"}
                  </SubmitButton>
                </Theme>
              )}
            >
              {(fields) => <>{Object.values(fields)}</>}
            </SchemaForm>

            {/* "Back to Sign Up" button, moved outside SchemaForm but inside the main YStack & FormProvider */}
            <Button
              theme="alt1"
              onPress={() => {
                setPendingVerification(false);
                setUiError(null);
                initialSignUpForm.reset(); 
              }}
              icon={Platform.OS !== 'web' ? ChevronLeft : undefined}
              mt="$4" // Added margin for spacing
            >
              Back to Sign Up
            </Button>
          </YStack>
        </FormProvider>
      </FormWrapper>
    );
  }

  // Initial Sign Up Form
  return (
    <FormWrapper>
      <FormProvider {...initialSignUpForm}>
        <SchemaForm
          form={initialSignUpForm}
          schema={SignUpSchema}
          onSubmit={handleSignUpSubmit}
          props={{
            email: {
              textContentType: 'emailAddress',
              autoComplete: 'email',
              keyboardType: 'email-address',
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
                <Paragraph color="$red10" my="$2" ta="center">{uiError}</Paragraph>
              )}
              <Theme inverse>
                <SubmitButton
                  onPress={() => submit()}
                  br="$10"
                  disabled={!isLoaded || initialSignUpForm.formState.isSubmitting}
                >
                  {isLoaded ? (initialSignUpForm.formState.isSubmitting ? "Signing Up..." : "Sign Up") : 'Loading...'}
                </SubmitButton>
              </Theme>
              <SignUpScreenSignInLink />
            </>
          )}
        >
          {(fields) => (
            <YStack p="$4" space="$4" backgroundColor="$background">
              <YStack gap="$3" mb="$4">
                <H2 $sm={{ size: '$8' }} color="$color">Get Started</H2>
                <Paragraph theme="alt1" color="$colorFocus">Create a new account</Paragraph>
              </YStack>
              {Object.values(fields)}
            </YStack>
          )}
        </SchemaForm>
      </FormProvider>
    </FormWrapper>
  );
};