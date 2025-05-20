// packages/app/features/home/screen.native.tsx
'use client'

import { Authenticated, Unauthenticated, AuthLoading, useConvexAuth } from 'convex/react'
import { useClerk, useUser } from '@clerk/clerk-expo'
import { Button, Text, YStack, Spinner, View } from '@my/ui'
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation' // Ensure this is from solito/navigation
import { useEffect } from 'react'

function CustomSignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <Button
      onPress={async () => {
        try {
          console.log('Attempting to sign out...')
          await signOut()
          console.log('Sign out successful, navigating to sign-in...')
          router.replace('/sign-in')
        } catch (e) {
          console.error('Sign out error:', e)
        }
      }}
    >
      <Text>Sign Out</Text>
    </Button>
  )
}

export default function HomeScreen() {
  const { isSignedIn: isClerkSignedIn, isLoaded: isClerkLoaded, user } = useUser()
  const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthenticated } = useConvexAuth()
  const router = useRouter() // Get the router instance here

  // Log detailed auth states (keep this)
  // useEffect(() => {
  //   console.log('--- HomeScreen Auth State Update ---')
  //   console.log('Clerk isLoaded:', isClerkLoaded)
  //   console.log('Clerk isSignedIn:', isClerkSignedIn)
  //   if (isClerkLoaded && isClerkSignedIn) {
  //     console.log('Clerk User ID:', user?.id)
  //   }
  //   console.log('Convex Auth isLoading:', isConvexAuthLoading)
  //   console.log('Convex isAuthenticated:', isConvexAuthenticated)
  //   console.log('-----------------------------------')
  // }, [isClerkLoaded, isClerkSignedIn, user, isConvexAuthLoading, isConvexAuthenticated])

  if (!isClerkLoaded) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4" space>
        <Spinner size="large" />
        <Text>Loading User Data...</Text>
      </YStack>
    )
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <AuthLoading>
        <Spinner />
        <Text>Verifying Session...</Text>
      </AuthLoading>

      <Unauthenticated>
        <Text>Welcome Guest!</Text>
        <Text>Please sign in to continue.</Text>
        {/* MODIFIED "Go to Sign In" Button: */}
        <Button
          onPress={() => {
            console.log("HomeScreen: 'Go to Sign In' button pressed. Navigating to /sign-in")
            router.push('/sign-in')
          }}
          mt="$2" // Example margin
        >
          <Text>Go to Sign In</Text>
        </Button>

        {isClerkSignedIn && (
          <YStack mt="$4" ai="center" space="$2" p="$2" boc="$red5" bw={1} br="$4">
            <Text ta="center" color="$red10">
              It seems your session with our services needs to be refreshed.
            </Text>
            <Text ta="center" fos="$2" color="$red8">
              (Clerk signed in, Convex not authenticated)
            </Text>
            <CustomSignOutButton />
          </YStack>
        )}
      </Unauthenticated>

      <Authenticated>
        <Text>Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}!</Text>
        <Text>You are successfully signed in.</Text>
        <CustomSignOutButton />
      </Authenticated>
    </YStack>
  )
}

// 'use client' // Not strictly necessary for React Native, but doesn't harm

// import { Authenticated, Unauthenticated, AuthLoading, useConvexAuth } from 'convex/react' // Added useConvexAuth
// import { useClerk, useUser } from '@clerk/clerk-expo' // useUser for user details
// import { Button, Text, YStack, Spinner } from '@my/ui' // Assuming Spinner from your ui package
// import { Link } from 'solito/link'
// import { useRouter } from 'solito/navigation'

// function CustomSignOutButton() {
//   const { signOut } = useClerk()
//   const router = useRouter()

//   return (
//     <Button
//       onPress={async () => {
//         try {
//           await signOut()
//           // Clerk's signOut might handle redirect via afterSignOutUrl,
//           // but programmatic redirect is fine too.
//           router.replace('/sign-in')
//         } catch (e) {
//           console.error('Sign out error', e)
//         }
//       }}
//     >
//       Sign Out
//     </Button>
//   )
// }

// export default function HomeScreen() {
//   // const { isLoading, isAuthenticated } = useConvexAuth(); // Convex auth state
//   const { user, isLoaded: isClerkLoaded } = useUser() // Clerk user details

//   // This check ensures Clerk has loaded its user state before trying to display user-specific info
//   if (!isClerkLoaded) {
//     return (
//       <YStack f={1} jc="center" ai="center">
//         <Spinner size="large" />
//         <Text>Loading user...</Text>
//       </YStack>
//     )
//   }

//   return (
//     <YStack f={1} jc="center" ai="center" p="$4" space>
//       <AuthLoading>
//         {/* This is Convex's loading state for its auth token validation */}
//         <Spinner />
//         <Text>Authenticating with Convex...</Text>
//       </AuthLoading>
//       <Unauthenticated>
//         <Text>Welcome! Please sign in to continue.</Text>
//         <Link href="/sign-in" passHref>
//           <Button>Go to Sign In</Button>
//         </Link>
//       </Unauthenticated>
//       <Authenticated>
//         <Text>Welcome {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}!</Text>
//         <Text>You are signed in.</Text>
//         <CustomSignOutButton />
//       </Authenticated>
//     </YStack>
//   )
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 'use client'

// import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
// import { useClerk } from '@clerk/clerk-expo' // For Next.js
// import { Button, Text, YStack } from '@my/ui' // Assuming from your ui package
// import { Link } from 'solito/link'
// import { useRouter } from 'solito/navigation'

// // A custom sign out button if you don't want the full UserButton
// function CustomSignOutButton() {
//   const { signOut } = useClerk()
//   const router = useRouter()

//   return (
//     <Button
//       onPress={async () => {
//         await signOut()
//         // Optionally redirect after sign out, though Clerk might handle this
//         // based on afterSignOutUrl in UserButton or env vars
//         router.replace('/sign-in')
//       }}
//     >
//       Sign Out
//     </Button>
//   )
// }

// export default function HomeScreen() {
//   // const { user } = useClerkUser(); // For native if you need user details from Clerk
//   return (
//     <YStack f={1} jc="center" ai="center" p="$4" space>
//       <AuthLoading>
//         <Text>Loading authentication...</Text>
//       </AuthLoading>
//       <Unauthenticated>
//         <Text>Welcome! Please sign in to continue.</Text>
//         <Link href="/sign-in" passHref>
//           <Button>Go to Sign In</Button>
//         </Link>
//         {/* Or use Clerk's pre-built button which opens their modal/hosted page */}
//         {/* <SignInButton mode="modal">
//           <Button>Sign In with Clerk</Button>
//         </SignInButton> */}
//       </Unauthenticated>
//       <Authenticated>
//         <Text>Welcome! You are signed in.</Text>
//         <CustomSignOutButton />
//       </Authenticated>
//     </YStack>
//   )
// }
