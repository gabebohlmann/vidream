// packages/app/features/navigation/TopNavBar.native.tsx
// Top Navbar with Swippable Drawer on Smaller Screens from Tamagui Bento
'use client'
import { Bell, Plus } from '@tamagui/lucide-icons'
import { Button, Text, View } from 'tamagui'
import { useMedia, Theme } from '@my/ui'
import VidreamIcon from '@my/ui/src/components/VidreamIcon'
import { Authenticated, useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/clerk-expo'
import { ProfileButton } from './ProfileButton.native'
import { useRouter } from 'solito/navigation'
import { useColorScheme } from 'react-native'

export default function TopNavBar() {
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth()
  const { user, isSignedIn } = useUser() //
  const isAuthenticated = isConvexAuthenticated && isSignedIn && user
  const { sm } = useMedia()
  const router = useRouter()
  const handleCreatePress = () => {
    router.push('/upload')
  }
  const statusBarHeight = 30
  const colorScheme = useColorScheme()
  return (
    <View
      flexDirection="column"
      width="100%"
      paddingTop={statusBarHeight} // Adjust for status bar height
      backgroundColor="$background" // Use theme color
      // Consider making height more dynamic or theme-based if 610/800 is too rigid
      // height={610}
      // $gtXs={{ height: 800 }}
      // $sm={{ pb: '$4' }} // Add some padding at the bottom for smaller screens if content gets cut
    >
      <View
        flexDirection="row"
        paddingHorizontal="$3" // Conistent padding
        paddingTop="$2"
        paddingBottom="$1"
        minWidth="100%"
        tag="nav"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="$background"
        borderBottomWidth={1} // Optional: add a subtle border
        borderBottomColor="$borderColor" // Optional
      >
        <View flexDirection="row" alignItems="center">
          {/* <SquarePlay size={32} color="#FFFFFF" strokeWidth={2.25} fill="#1b9e0a" /> */}
          <VidreamIcon />
          <Text paddingLeft="$2" fontSize="$6" fontWeight="bold">
            Vidream
          </Text>
        </View>
        {/* Right corner buttons */}
        <View flexDirection="row" alignItems="center" gap="$3">
          {/* Conditionally rendered Create Button */}
          <Authenticated>
            <Button size="$2" onPress={handleCreatePress} icon={<Plus size="$1" />}></Button>
            <Button circular chromeless padding="$0" size="$2">
              <Button.Icon>
                <Bell size="$1" strokeWidth={2} />
              </Button.Icon>
            </Button>
          </Authenticated>
          <ProfileButton />
        </View>
      </View>
    </View>
  )
}
