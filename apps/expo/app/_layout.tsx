// apps/expo/app/_layout.tsx
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from 'app/provider' // Your app's custom provider
import { NativeToast } from '@my/ui/src/NativeToast'
import { ClerkProvider, useAuth, ClerkLoaded } from '@clerk/clerk-expo'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import * as SecureStore from 'expo-secure-store'
import TopNavBar from 'app/features/navigation/TopNavBar.native'

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key)
    } catch (err) {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      // Silently fail
    }
  },
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string)
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Check your .env file.')
}
if (!process.env.EXPO_PUBLIC_CONVEX_URL) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL. Check your .env file.')
}

export const unstable_settings = {
  // Ensure that reloading on `/user` keeps a back button present.
  // This should match a screen name or group that contains your home/initial content.
  initialRouteName: '(tabs)', // Or 'index' if app/index.tsx is your primary entry
}

SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
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

  return (
    <ClerkProvider publishableKey={clerkPublishableKey!} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkLoaded>
          <Provider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <TopNavBar />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <NativeToast />
            </ThemeProvider>
          </Provider>
        </ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
