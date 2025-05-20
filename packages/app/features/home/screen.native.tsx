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
