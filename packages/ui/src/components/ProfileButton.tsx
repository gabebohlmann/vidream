// packages/ui/src/components/ProfileButton.tsx
import { Avatar, Button, Popover, PopoverTrigger, View, Text, styled, useEvent } from 'tamagui'
import { useUser, useClerk } from '@clerk/nextjs' // Or your specific Clerk import e.g. @clerk/nextjs
import { Authenticated, Unauthenticated, useConvexAuth } from 'convex/react'
import { useState } from 'react'
import { Link } from 'solito/link'

export function ProfileButton() {
  const { isLoading: isConvexAuthLoading, isAuthenticated } = useConvexAuth()
  const { openSignIn, signOut } = useClerk()
  const { user, isSignedIn } = useUser() // isSignedIn can also be useful from useUser

  const [triggerOpen, setTriggerOpen] = useState(false)
  const closeTrigger = useEvent(() => {
    setTriggerOpen(false)
  })

  // It's good practice to check both Clerk's isSignedIn and Convex's isAuthenticated
  // and also ensure the user object is loaded if you intend to use its properties.
  const fullyAuthenticated = isAuthenticated && isSignedIn && user

  if (isConvexAuthLoading) {
    // You can return a SizableText or a more sophisticated Skeleton component
    return (
      <Button chromeless disabled>
        Loading...
      </Button>
    )
  }

  return (
    <>
      <Unauthenticated>
        {/* <Button onPress={() => openSignIn()} themeInverse>
          Sign In
        </Button> */}
        <Button themeInverse>
          <Link href="/sign-in">
            <Text>Go to Sign In</Text>
          </Link>
        </Button>
      </Unauthenticated>
      <Authenticated>
        {fullyAuthenticated ? (
          <Popover
            offset={{
              mainAxis: 5,
            }}
            placement="bottom-end"
            open={triggerOpen}
            onOpenChange={setTriggerOpen}
          >
            <PopoverTrigger asChild>
              <Button circular chromeless>
                <Avatar circular size="$3">
                  <Avatar.Image
                    pointerEvents="none"
                    aria-label="user photo"
                    src={user.imageUrl || 'https://i.pravatar.cc/123'} // Use Clerk user image
                  />
                  <Avatar.Fallback backgroundColor="$gray10" />
                </Avatar>
              </Button>
            </PopoverTrigger>
            <Popover.Content
              borderWidth={1}
              borderColor="$borderColor"
              backgroundColor="$color1"
              padding={0}
              enterStyle={{ y: -10, opacity: 0 }}
              exitStyle={{ y: -10, opacity: 0 }}
              animation={[
                'quick',
                {
                  opacity: {
                    overshootClamping: true,
                  },
                },
              ]}
              elevation="$2" // Using theme token for elevation
              overflow="hidden"
            >
              <DropDownItem
                onPress={() => {
                  // TODO: Implement navigation/action for Accounts
                  console.log('Accounts clicked')
                  closeTrigger()
                }}
              >
                <DropDownText>Accounts</DropDownText>
              </DropDownItem>
              <DropDownItem
                onPress={() => {
                  // TODO: Implement navigation/action for Settings
                  console.log('Settings clicked')
                  closeTrigger()
                }}
              >
                <DropDownText>Settings</DropDownText>
              </DropDownItem>
              <DropDownItem
                onPress={async () => {
                  await signOut()
                  closeTrigger()
                }}
              >
                <DropDownText>Sign Out</DropDownText>
              </DropDownItem>
            </Popover.Content>
          </Popover>
        ) : (
          // Fallback in case isAuthenticated is true but user object isn't loaded yet
          // or if there's a discrepancy. Can also redirect to sign-in.
          <Button onPress={() => openSignIn()} themeInverse>
            Sign In
          </Button>
        )}
      </Authenticated>
    </>
  )
}

const DropDownItem = styled(View, {
  name: 'DropDownItem', // Good for debugging and theming
  backgroundColor: '$background',
  width: '100%',
  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },
  pressStyle: {
    backgroundColor: '$backgroundPress',
  },
  cursor: 'pointer',
  paddingHorizontal: '$4',
  paddingVertical: '$3', // Adjusted for better spacing
  alignItems: 'flex-start', // Usually dropdown items are left-aligned
  justifyContent: 'center',
  $xs: {
    paddingHorizontal: '$3',
    paddingVertical: '$2',
  },
})

const DropDownText = styled(Text, {
  name: 'DropDownText',
  fontWeight: '$2', // Using theme tokens for font weight
  fontSize: '$4', // Using theme tokens for font size
  lineHeight: '$1', // Using theme tokens for line height
  $xs: {
    fontSize: '$3',
  },
})
