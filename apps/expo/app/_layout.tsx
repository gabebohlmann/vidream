// apps/expo/app/_layout.tsx
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from 'app/provider'
import { NativeToast } from '@my/ui/src/NativeToast'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string)
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

export const unstable_settings = {
  // Ensure that reloading on `/user` keeps a back button present.
  initialRouteName: 'Home',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Provider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                headerTransparent: true,
                headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
                headerTitleContainerStyle: {
                  paddingTop: insets.top,
                  // You might need to adjust alignItems or justifyContent if the title looks off-center vertically
                  // alignItems: 'center', // Default is usually center
                  // justifyContent: 'center', // Default is usually center
                },
                headerRightContainerStyle: {
                  paddingTop: insets.top,
                },
              }}
            />
            <NativeToast />
          </ThemeProvider>
        </Provider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
