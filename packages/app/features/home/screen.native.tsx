// packages/app/features/home/screen.native.tsx
import React from 'react'
import { useUser, useClerk } from '@clerk/clerk-expo'
import { Button, Text } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { HomeView } from './view' // Import the shared view

// Native-specific Sign-Out Button (can be defined here or imported if shared more broadly)
const NativeCustomSignOutButton = () => {
  const { signOut } = useClerk()
  const router = useRouter()
  return (
    <Button
      onPress={async () => {
        try {
          await signOut()
          router.replace('/(auth)/sign-in') // Path to your sign-in screen
        } catch (e) {
          console.error('Native Sign out error:', e)
        }
      }}
    >
      <Text>Sign Out</Text>
    </Button>
  )
}

// Native-specific Sign-In Action
const NativeSignInAction = () => {
  const router = useRouter()
  return (
    <Button onPress={() => router.push('/sign-in')}>
      <Text>Sign In</Text>
    </Button>
  )
}

export default function HomeScreenNativeWrapper() {
  const { isSignedIn: isClerkSignedIn, isLoaded: isClerkLoaded, user } = useUser()
  const userDisplayName = user?.firstName || user?.emailAddresses[0]?.emailAddress

  return (
    <HomeView
      isClerkLoaded={isClerkLoaded}
      isClerkSignedIn={isClerkSignedIn || false} // Ensure boolean
      userDisplayName={userDisplayName}
      SignInActionComponent={NativeSignInAction}
      UserActionsComponent={NativeCustomSignOutButton}
    />
  )
}
