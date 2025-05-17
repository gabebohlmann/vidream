// packages/app/features/auth/sign-up-screen.tsx
'use client';

import {
  Button,
  FormWrapper,
  H2,
  Paragraph,
  SubmitButton,
  Text,
  Theme, // Keep Theme import for the nested <Theme inverse>
  YStack,
  // isWeb,
} from '@my/ui';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { SchemaForm, formFields } from 'app/utils/SchemaForm';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Link } from 'solito/link';
import { z } from 'zod';
import { useSearchParams, useUpdateSearchParams, useRouter } from 'solito/navigation';
// import { Platform } from 'react-native'; // For platform-specific logging if needed during debugging

const SignUpSchema = z.object({
  email: formFields.text.email().describe('Email // your@email.acme'),
  password: formFields.text.min(6).describe('Password // Choose a password'),
});

export const SignUpScreen = () => {
  const router = useRouter();
  const rawSearchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const emailFromQuery = useMemo(() => {
    if (!rawSearchParams || typeof rawSearchParams.get !== 'function') {
      return undefined;
    }
    return rawSearchParams.get('email');
  }, [rawSearchParams]);

  useEffect(() => {
    if (emailFromQuery) {
      updateSearchParams({ email: undefined }, { replace: true });
    }
  }, [emailFromQuery, updateSearchParams]);

  const form = useForm<z.infer<typeof SignUpSchema>>();

  async function signUpWithEmail({ email, password }: z.infer<typeof SignUpSchema>) {
    console.log('Attempting to sign up with:', { email, password });
    const error = false;

    if (error) {
      const errorMessage = 'Simulated sign-up error';
      if (errorMessage.includes('email')) {
        form.setError('email', { type: 'custom', message: errorMessage });
      } else if (errorMessage.includes('password')) {
        form.setError('password', { type: 'custom', message: errorMessage });
      } else {
        form.setError('password', { type: 'custom', message: errorMessage });
      }
    } else {
      console.log('Sign up successful simulation');
    }
  }

  // Removed the explicit <Theme name="light"> wrapper.
  // The app should now rely on the globally configured theme.
  return (
    <FormProvider {...form}>
      {form.formState.isSubmitSuccessful ? (
        <CheckYourEmail />
      ) : (
        <SchemaForm
          form={form}
          schema={SignUpSchema}
          defaultValues={{
            email: emailFromQuery || '',
            password: '',
          }}
          onSubmit={signUpWithEmail}
          props={{
            password: {
              secureTextEntry: true,
            },
          }}
          renderAfter={({ submit }) => (
            <>
              <Theme inverse> {/* This nested Theme remains and will invert the parent theme */}
                <SubmitButton onPress={() => submit()} br="$10">
                  Sign Up
                </SubmitButton>
              </Theme>
              <SignUpScreenSignInLink />
            </>
          )}
        >
          {(fields) => (
            <YStack p="$4" space="$4" backgroundColor="$background"> {/* Assumes $background is theme-aware */}
              <YStack gap="$3" mb="$4">
                <H2 $sm={{ size: '$8' }} color="$color"> {/* Assumes $color is theme-aware */}
                  Get Started
                </H2>
                <Paragraph theme="alt2" color="$colorFocus"> {/* Assumes $colorFocus is theme-aware */}
                  Create a new account
                </Paragraph>
              </YStack>
              {Object.values(fields)}
            </YStack>
          )}
        </SchemaForm>
      )}
    </FormProvider>
  );
};

const CheckYourEmail = () => {
  const { getValues, reset } = useFormContext<z.infer<typeof SignUpSchema>>();
  const email = getValues('email');

  return (
    <FormWrapper>
      <FormWrapper.Body>
        <YStack gap="$3" p="$4" ai="center">
          <H2 color="$color">Check Your Email</H2>
          <Paragraph theme="alt1" color="$colorFocus" ta="center">
            We&apos;ve sent you a confirmation link. Please check your email ({email}) and confirm
            it.
          </Paragraph>
        </YStack>
      </FormWrapper.Body>
      <FormWrapper.Footer>
        <Button themeInverse icon={ChevronLeft} br="$10" onPress={() => reset()}>
          Back to Sign Up
        </Button>
      </FormWrapper.Footer>
    </FormWrapper>
  );
};

const SignUpScreenSignInLink = () => {
  const { watch } = useFormContext<z.infer<typeof SignUpSchema>>();
  const email = watch('email');

  const queryParams = new URLSearchParams();
  if (email) {
    queryParams.set('email', email);
  }
  const href = `/sign-in${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return (
    <Link href={href}>
      <Paragraph ta="center" theme="alt1" mt="$2" color="$colorFocus">
        Already signed up?{' '}
        <Text textDecorationLine="underline" color="$colorPress">
          Sign in
        </Text>
      </Paragraph>
    </Link>
  );
};