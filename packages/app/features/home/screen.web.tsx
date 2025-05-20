// Example for apps/next/app/page.tsx
'use client'

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton, useClerk } from "@clerk/nextjs"; // For Next.js
// For native, you'd import from '@clerk/clerk-expo'
// import { useUser as useClerkUser } from "@clerk/clerk-expo"; // if needing user info on native
// import { Button as TamaguiButton, Text, YStack } from "tamagui"; // Your UI library
import { Button, Text, YStack } from "@my/ui"; // Assuming from your ui package
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation';
// import { api } from "@/convex/_generated/api"; // If using Convex queries
// import { useQuery } from "convex/react";

// A custom sign out button if you don't want the full UserButton
function CustomSignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <Button
      onPress={async () => {
        await signOut();
        // Optionally redirect after sign out, though Clerk might handle this
        // based on afterSignOutUrl in UserButton or env vars
        router.replace('/sign-in');
      }}
    >
      Sign Out
    </Button>
  );
}

export default function HomePage() {
  // const { user } = useClerkUser(); // For native if you need user details from Clerk
  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <AuthLoading>
        <Text>Loading authentication...</Text>
      </AuthLoading>
      <Unauthenticated>
        <Text>Welcome! Please sign in to continue.</Text>
        <Link href="/sign-in" passHref>
          <Button>Go to Sign In</Button>
        </Link>
        {/* Or use Clerk's pre-built button which opens their modal/hosted page */}
        {/* <SignInButton mode="modal">
          <Button>Sign In with Clerk</Button>
        </SignInButton> */}
      </Unauthenticated>
      <Authenticated>
        <Text>Welcome! You are signed in.</Text>
        {/* Easiest: Clerk's UserButton with built-in sign out */}
        {/* For Next.js, afterSignOutUrl defaults to SIGN_OUT_URL then FALLBACK_REDIRECT_URL */}
        <UserButton afterSignOutUrl="/sign-in" />
        {/* Or your custom button */}
        {/* <CustomSignOutButton /> */}
        {/* <Content /> */}
      </Authenticated>
    </YStack>
  );
}

// function Content() {
//   // Example: Fetch data if user is authenticated
//   // const messages = useQuery(api.messages.getForCurrentUser);
//   // const { user } = useUser(); // Clerk's useUser from @clerk/nextjs or @clerk/clerk-react
//   return (
//     <YStack>
//       <Text>Authenticated Content Area</Text>
//       {/* <Text>Your messages: {messages?.length ?? 0}</Text> */}
//     </YStack>
//   );
// }