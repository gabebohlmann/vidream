// packages/app/features/home/screen.web.tsx
'use client'
import React from 'react'
import { useUser, UserButton } from '@clerk/nextjs' // Web specific
import { Button, Text } from '@my/ui' // Your UI components
import { Link } from 'solito/link' // For web-style links
import { HomeView } from './view' // Import the shared view

// Web-specific User Actions (using Clerk's UserButton)
const WebUserActions = () => {
  return <UserButton afterSignOutUrl="/sign-in" />
}

// Web-specific Sign-In Action
const WebSignInAction = () => {
  return (
    <>
      <Button themeInverse>
        <Link href="/sign-in">
          <Text>Sign In</Text>
        </Link>
      </Button>
    </>
  )
}

export default function HomeScreenWebWrapper() {
  // For web, useUser from @clerk/nextjs is the way to get user info
  // isLoaded and isSignedIn are part of its return type.
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user } = useUser()
  const userDisplayName = user?.firstName || user?.emailAddresses[0]?.emailAddress

  return (
    <HomeView
      isClerkLoaded={isClerkLoaded}
      isClerkSignedIn={isClerkSignedIn || false} // Ensure boolean
      userDisplayName={userDisplayName}
      SignInActionComponent={WebSignInAction}
      UserActionsComponent={WebUserActions}
    />
  )
}
