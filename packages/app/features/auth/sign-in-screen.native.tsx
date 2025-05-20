// packages/app/features/auth/sign-in-screen.native.tsx
import React, { useMemo } from 'react'
import { useSignIn as useClerkSignInNative } from '@clerk/clerk-expo'
import { SignInForm, ClerkSignInProps } from './sign-in-form' // Adjust path if needed
import { useSearchParams } from 'solito/navigation'

export default function SignInScreen() {
  // Keep consistent export for Solito if needed
  const clerkSignInHookOutput = useClerkSignInNative() || {
    isLoaded: false,
    signIn: undefined,
    setActive: async () => {},
  }
  const searchParams = useSearchParams()

  const initialEmail = useMemo(() => {
    if (searchParams && typeof searchParams.get === 'function') {
      return searchParams.get('email')
    }
    return null
  }, [searchParams])

  // Cast or map to the ClerkSignInProps interface if types differ slightly
  const clerkProps: ClerkSignInProps = {
    isLoaded: clerkSignInHookOutput.isLoaded,
    signIn: clerkSignInHookOutput.signIn,
    setActive: clerkSignInHookOutput.setActive,
  }

  return <SignInForm clerkSignIn={clerkProps} initialEmail={initialEmail} />
}
// 'use client';

// import { FormWrapper, H2, Paragraph, SubmitButton, Text, Theme, YStack, Button } from '@my/ui';
// import { SchemaForm, formFields } from 'app/utils/SchemaForm'; // Assuming these are your utils
// import { useState, useEffect, useMemo } from 'react';
// import { FormProvider, useForm, useFormContext } from 'react-hook-form';
// import { Link } from 'solito/link';
// import { useRouter, useSearchParams } from 'solito/navigation';
// import { z } from 'zod';
// import { useSignIn } from '@clerk/clerk-expo'; // Correct for native

// // Define your Zod schema for the sign-in form
// const SignInSchema = z.object({
//   email: formFields.text.email().describe('Email // Enter your email'),
//   password: formFields.text.min(6).describe('Password // Enter your password'),
// });

// // ForgotPasswordLink Component
// const ForgotPasswordLink = () => {
//   const { watch } = useFormContext<z.infer<typeof SignInSchema>>(); // Ensure FormProvider is wrapping this
//   const email = watch('email'); // Get current email from the form, if filled
//   const router = useRouter(); // Using router for programmatic navigation if needed, but Link is fine

//   // Construct Href for Solito's Link component
//   // Expo Router will handle query parameters in the path string
//   const queryParams = new URLSearchParams();
//   if (email) {
//     queryParams.set('email', email);
//   }
//   const href = `/(auth)/reset-password${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

//   return (
//     // Using Solito's Link to navigate.
//     // passHref might be useful if the child component is a custom one that can accept and use an href prop.
//     // For a simple Text component, Link will make it pressable.
//     <Link href={href}>
//       <Paragraph
//         mt="$2" // A little margin for spacing
//         theme="alt2"
//         textDecorationLine="underline"
//         color="$colorFocus"
//         accessibilityRole="link" // Good for accessibility
//         textAlign="right" // Align to the right if desired under the password field
//       >
//         Forgot your password?
//       </Paragraph>
//     </Link>
//   );
// };

// export const SignInScreen = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [clerkError, setClerkError] = useState<string | null>(null);

//   const { signIn, setActive, isLoaded } = useSignIn() || {};

//   useEffect(() => {
//     console.log('[SignInScreen] Clerk useSignIn State:', { isLoaded, hasSignIn: !!signIn, hasSetActive: !!setActive });
//   }, [isLoaded, signIn, setActive]);

//   const emailFromQuery = useMemo(() => {
//     if (searchParams && typeof searchParams.get === 'function') {
//       return searchParams.get('email');
//     }
//     return null;
//   }, [searchParams]);

//   const form = useForm<z.infer<typeof SignInSchema>>({
//     defaultValues: {
//       email: emailFromQuery || '',
//       password: '',
//     },
//   });

//   async function handleSignIn(data: z.infer<typeof SignInSchema>) {
//     console.log('[SignInScreen] handleSignIn CALLED with data:', data);

//     if (!isLoaded || !signIn || !setActive) {
//       console.error('[SignInScreen] Clerk useSignIn not ready or available.', { isLoaded, hasSignIn: !!signIn, hasSetActive: !!setActive });
//       setClerkError("Clerk's sign-in service is not ready. Please wait a moment and try again.");
//       return;
//     }
//     setClerkError(null);

//     try {
//       console.log('[SignInScreen] Attempting signIn.create...');
//       const result = await signIn.create({
//         identifier: data.email,
//         password: data.password,
//       });
//       console.log('[SignInScreen] signIn.create result:', result);

//       if (result.status === 'complete') {
//         console.log('[SignInScreen] Sign in complete. Attempting setActive...');
//         await setActive({ session: result.createdSessionId });
//         console.log('[SignInScreen] setActive successful. Navigating to home...');
//         router.replace('/');
//       } else {
//         console.error('[SignInScreen] Clerk Sign In status not complete:', JSON.stringify(result, null, 2));
//         setClerkError('Sign-in requires additional steps or has failed. Status: ' + result.status);
//       }
//     } catch (err: any) {
//       console.error('[SignInScreen] Clerk Sign In Error in catch block:', JSON.stringify(err, null, 2));
//       const defaultMessage = 'An error occurred during sign in. Please try again.';
//       const clerkErrorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || defaultMessage;
//       setClerkError(clerkErrorMessage);
//     }
//   }

//   return (
//     <FormWrapper>
//       {/* FormProvider is crucial for useFormContext in ForgotPasswordLink */}
//       <FormProvider {...form}>
//         <SchemaForm
//           form={form}
//           schema={SignInSchema}
//           onSubmit={handleSignIn}
//           // Props to pass to specific fields rendered by SchemaForm
//           props={{
//             email: { // Crucial for email autofill
//               keyboardType: 'email-address', // Good practice
//             },
//             password: {
//               secureTextEntry: true, // Crucial for password autofill on sign-in
//               afterElement: <ForgotPasswordLink />,
//             },
//           }}
//           renderAfter={({ submit }) => (
//             <>
//               {clerkError && (
//                 <Paragraph color="$red10" my="$2" ta="center">
//                   {clerkError}
//                 </Paragraph>
//               )}
//               <Theme inverse>
//                 <SubmitButton
//                   onPress={() => {
//                     console.log('[SignInScreen] SubmitButton PRESSED');
//                     if (!isLoaded) {
//                       console.warn('[SignInScreen] SubmitButton pressed, but Clerk is not loaded.');
//                       setClerkError("Still loading authentication services. Please wait.");
//                       return;
//                     }
//                     submit();
//                   }}
//                   br="$10"
//                   disabled={!isLoaded || form.formState.isSubmitting}
//                 >
//                   <Text>{isLoaded ? (form.formState.isSubmitting ? 'Signing In...' : 'Sign In') : 'Loading...'}</Text>
//                 </SubmitButton>
//               </Theme>
//               <Link href="/(auth)/sign-up" passHref>
//                 <Paragraph ta="center" mt="$2" theme="alt1" textDecorationLine="underline" accessibilityRole="link">
//                   Don&apos;t have an account? <Text>Sign up</Text>
//                 </Paragraph>
//               </Link>
//             </>
//           )}
//         >
//           {(fields) => (
//             <YStack p="$4" space="$4" backgroundColor="$background">
//               <YStack gap="$3" mb="$4">
//                 <H2 $sm={{ size: '$8' }} color="$color">Welcome Back</H2>
//                 <Paragraph theme="alt1" color="$colorFocus">Sign in to your account</Paragraph>
//               </YStack>
//               {Object.values(fields)}
//             </YStack>
//           )}
//         </SchemaForm>
//       </FormProvider>
//     </FormWrapper>
//   );
// };
