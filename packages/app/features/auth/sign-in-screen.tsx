// packages/app/features/auth/sign-in-screen.tsx
'use client'

import {
  FormWrapper,
  H2,
  // LoadingOverlay, // Uncomment if needed
  Paragraph,
  SubmitButton,
  Text,
  Theme,
  YStack,
  // isWeb, // Uncomment if needed
  Button,
} from '@my/ui'
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
// import { useSupabase } from 'app/utils/supabase/useSupabase';
// import { useUser } from 'app/utils/useUser';
import { useEffect, useMemo } from 'react' // Added useMemo
import { FormProvider, useForm, useWatch, useFormContext } from 'react-hook-form'
// Removed: import { createParam } from 'solito';
import { Link } from 'solito/link'
// Import all router/param hooks from solito/navigation
import { useRouter, useSearchParams, useUpdateSearchParams, useLink } from 'solito/navigation'
import { z } from 'zod'

// import { SocialLogin } from './components/SocialLogin';

// Removed: const { useParams, useUpdateParams } = createParam<{ email?: string }>();

const SignInSchema = z.object({
  email: formFields.text.email().describe('Email // Enter your email'),
  password: formFields.text.min(6).describe('Password // Enter your password'),
})

export const SignInScreen = () => {
  // const supabase = useSupabase();
  const router = useRouter() // From solito/navigation
  const searchParams = useSearchParams() // From solito/navigation
  const updateSearchParams = useUpdateSearchParams() // From solito/navigation

  const emailFromQuery = useMemo(() => {
    if (!searchParams || typeof searchParams.get !== 'function') {
      return undefined
    }
    return searchParams.get('email')
  }, [searchParams])

  // const { isLoadingSession } = useUser(); // Uncomment if needed
  // useRedirectAfterSignIn(); // If this custom hook is used, ensure its internal useRouter is also from solito/navigation

  useEffect(() => {
    // remove the persisted email from the url
    if (emailFromQuery) {
      updateSearchParams({ email: undefined }, { web: { replace: true } }) // `web: { replace: true }` is a common pattern, check Solito docs if API differs for useUpdateSearchParams
    }
  }, [emailFromQuery, updateSearchParams])

  const form = useForm<z.infer<typeof SignInSchema>>()

  async function signInWithEmail({ email, password }: z.infer<typeof SignInSchema>) {
    console.log('Attempting sign in with:', { email, password })
    const error = false // Placeholder for actual API call
    // const { error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // if (error) {
    //   const errorMessage = (error as any)?.message.toLowerCase();
    //   if (errorMessage.includes('email')) {
    //     form.setError('email', { type: 'custom', message: errorMessage });
    //   } else if (errorMessage.includes('password')) {
    //     form.setError('password', { type: 'custom', message: errorMessage });
    //   } else {
    //     form.setError('password', { type: 'custom', message: errorMessage });
    //   }
    // } else {
    //   router.replace('/'); // router is now from solito/navigation
    // }
  }

  return (
    // Ensure your global theme provider makes this visible.
    <FormWrapper>
      <FormProvider {...form}>
        <SchemaForm
          form={form}
          schema={SignInSchema}
          defaultValues={{
            email: emailFromQuery || '', // Use email from useSearchParams
            password: '',
          }}
          onSubmit={signInWithEmail}
          props={{
            password: {
              afterElement: <ForgotPasswordLink />,
              secureTextEntry: true,
            },
          }}
          renderAfter={({ submit }) => {
            return (
              <>
                <Theme inverse>
                  <SubmitButton onPress={() => submit()} br="$10">
                    Sign In
                  </SubmitButton>
                </Theme>
                <SignInScreenSignUpLink /> {/* Renamed for clarity */}
                {/* {isWeb && <SocialLogin />} */}
              </>
            )
          }}
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
        {/* {isLoadingSession && <LoadingOverlay />} */}
      </FormProvider>
    </FormWrapper>
  )
}

const SignInScreenSignUpLink = () => {
  // Renamed for clarity
  // const email = useWatch<z.infer<typeof SignInSchema>>({ name: 'email' }); // email from this form is not strictly needed for a generic link to sign-up

  // The useLink for /reset-password here seems unrelated to a sign-up link.
  // If you want to pass the current email to the sign-up page, you'd get it from useFormContext.
  const { watch } = useFormContext<z.infer<typeof SignInSchema>>()
  // const emailForSignUp = watch('email');

  const router = useRouter() // From solito/navigation
  const navigateToSignUp = () => {
    // If you want to pass the email:
    // const queryParams = new URLSearchParams();
    // if (emailForSignUp) {
    //   queryParams.set('email', emailForSignUp);
    // }
    // router.push(`/sign-up${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    router.push('/sign-up') // Simple navigation without email param
  }

  return (
    <Button onPress={navigateToSignUp} mt="$2">
      {' '}
      {/* Ensure Button is styled for this context */}
      <Paragraph ta="center" theme="alt1">
        {' '}
        {/* Custom styling for Button content */}
        Don&apos;t have an account? <Text textDecorationLine="underline">Sign up</Text>
      </Paragraph>
    </Button>
  )
}

const ForgotPasswordLink = () => {
  const { watch } = useFormContext<z.infer<typeof SignInSchema>>()
  const email = watch('email')

  const queryParams = new URLSearchParams()
  if (email) {
    queryParams.set('email', email)
  }
  const href = `/reset-password${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return (
    <Link href={href}>
      <Paragraph mt="$1" theme="alt2" textDecorationLine="underline" color="$colorFocus">
        Forgot your password?
      </Paragraph>
    </Link>
  )
}

// function useRedirectAfterSignIn() {
//   // const supabase = useSupabase();
//   const router = useRouter(); // This would now correctly be from solito/navigation
//   useEffect(() => {
//     // ... your auth state change logic ...
//     // if (event === 'SIGNED_IN') {
//     //   router.replace('/');
//     // }
//   }, [/* supabase, */ router]);
// }

// we use this hook here because this is the page we redirect unauthenticated users to
// if they authenticate on this page, this will redirect them to the home page
// function useRedirectAfterSignIn() {
//   const supabase = useSupabase()
//   const router = useRouter()
//   useEffect(() => {
//     const signOutListener = supabase.auth.onAuthStateChange((event) => {
//       if (event === 'SIGNED_IN') {
//         router.replace('/')
//       }
//     })
//     return () => {
//       signOutListener.data.subscription.unsubscribe()
//     }
//   }, [supabase, router])
// }
