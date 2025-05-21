// packages/app/features/home/view.tsx
import React from 'react'
import { YStack, Text, Spinner, View } from '@my/ui' // Assuming View is also from @my/ui or react-native
import { useConvexAuth } from 'convex/react' // Convex hooks are platform-agnostic

export interface HomeViewProps {
  // State from platform-specific Clerk's useUser()
  isClerkLoaded: boolean
  isClerkSignedIn: boolean // For the fallback sign-out button scenario
  userDisplayName?: string

  // Components to be rendered, provided by platform-specific screens
  SignInActionComponent: React.FC
  UserActionsComponent: React.FC // This will render UserButton on web, CustomSignOutButton on native
}

export const HomeView: React.FC<HomeViewProps> = ({
  isClerkLoaded,
  isClerkSignedIn,
  userDisplayName,
  SignInActionComponent,
  UserActionsComponent,
}) => {
  const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthenticated } = useConvexAuth()

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
      {/* AuthLoading equivalent */}
      {isConvexAuthLoading && (
        <YStack ai="center" space>
          <Spinner />
          <Text>Verifying Session...</Text>
        </YStack>
      )}

      {/* Unauthenticated equivalent */}
      {!isConvexAuthLoading && !isConvexAuthenticated && (
        <YStack ai="center" space>
          <View mt="$2">
            <SignInActionComponent />
          </View>

          {isClerkSignedIn && ( // Fallback if Clerk is signed in but Convex is not
            <YStack mt="$4" ai="center" space="$2" p="$2" boc="$red5" bw={1} br="$4">
              <Text ta="center" color="$red10">
                It seems your session with our services needs to be refreshed.
              </Text>
              <Text ta="center" fos="$2" color="$red8">
                (Clerk signed in, Convex not authenticated)
              </Text>
              <UserActionsComponent />
            </YStack>
          )}
        </YStack>
      )}

      {/* Authenticated equivalent */}
      {!isConvexAuthLoading && isConvexAuthenticated && (
        <YStack ai="center" space>
          <Text>Welcome, {userDisplayName || 'User'}!</Text>
          <Text>You are successfully signed in.</Text>
          <View mt="$2">
            <UserActionsComponent />
          </View>
        </YStack>
      )}
    </YStack>
  )
}
