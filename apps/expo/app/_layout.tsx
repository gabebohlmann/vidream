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
              <Stack
                screenOptions={{
                  headerShown: true,
                }}
              >
                <Stack.Screen name="index" options={{ title: 'Home' }} />

                {/* Refer to the (auth) group; its layout will handle individual auth screens */}
                <Stack.Screen
                  name="(auth)"
                  options={{
                    // presentation: 'modal', // If all auth screens should be modals
                    headerShown: false, // Or specific options for the group
                  }}
                />
              </Stack>
              <NativeToast />
            </ThemeProvider>
          </Provider>
        </ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import { useEffect } from 'react'
// import { useColorScheme } from 'react-native'
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
// import { useFonts } from 'expo-font'
// import { SplashScreen, Stack } from 'expo-router'
// import { Provider } from 'app/provider' // Your app's custom provider
// import { NativeToast } from '@my/ui/src/NativeToast'
// import { ClerkProvider, useAuth, ClerkLoaded } from '@clerk/clerk-expo' // Import ClerkLoaded
// import { ConvexProviderWithClerk } from 'convex/react-clerk'
// import { ConvexReactClient } from 'convex/react'
// // tokenCache should be imported from clerk-expo directly if available or defined as in the guide
// // For example: import { tokenCache } from './tokenCache'; // if you created a separate file
// // Or ensure it's correctly defined like in the guide:
// import * as SecureStore from 'expo-secure-store'

// // Define tokenCache as recommended by Clerk for Expo
// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       return SecureStore.getItemAsync(key)
//     } catch (err) {
//       return null
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       return SecureStore.setItemAsync(key, value)
//     } catch (err) {
//       // Silently fail
//     }
//   },
// }

// const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string)
// const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

// if (!clerkPublishableKey) {
//   throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Check your .env file.')
// }
// if (!process.env.EXPO_PUBLIC_CONVEX_URL) {
//   throw new Error('Missing EXPO_PUBLIC_CONVEX_URL. Check your .env file.')
// }

// export const unstable_settings = {
//   initialRouteName: '(tabs)', // Assuming your home is part of a tab layout
// }

// SplashScreen.preventAutoHideAsync()

// export default function AppLayout() {
//   // Renamed from App to AppLayout for clarity
//   const [interLoaded, interError] = useFonts({
//     Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
//     InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
//   })

//   useEffect(() => {
//     if (interLoaded || interError) {
//       SplashScreen.hideAsync()
//     }
//   }, [interLoaded, interError])

//   if (!interLoaded && !interError) {
//     return null
//   }

//   return <RootLayoutNav />
// }

// function RootLayoutNav() {
//   const colorScheme = useColorScheme()

//   return (
//     <ClerkProvider publishableKey={clerkPublishableKey!} tokenCache={tokenCache}>
//       <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
//         <ClerkLoaded>
//           <Provider>
//             {' '}
//             {/* Your custom app/provider */}
//             <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//               <Stack
//                 screenOptions={{
//                   headerShown: false, // Generally hide default header if using custom
//                 }}
//               >
//                 <Stack.Screen name="index" options={{ title: 'Home' }} />
//                 <Stack.Screen
//                   name="(auth)/sign-in"
//                   options={{ title: 'Sign In', presentation: 'modal' }}
//                 />
//                 <Stack.Screen
//                   name="(auth)/sign-up"
//                   options={{ title: 'Sign Up', presentation: 'modal' }}
//                 />
//                 <Stack.Screen
//                   name="(auth)/reset-password"
//                   options={{ title: 'Reset Password', presentation: 'modal' }}
//                 />
//               </Stack>
//               <NativeToast />
//             </ThemeProvider>
//           </Provider>
//         </ClerkLoaded>
//       </ConvexProviderWithClerk>
//     </ClerkProvider>
//   )
// }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import { useEffect } from 'react'
// import { useColorScheme } from 'react-native'
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
// import { useFonts } from 'expo-font'
// import { SplashScreen, Stack } from 'expo-router'
// import { Provider } from 'app/provider'
// import { NativeToast } from '@my/ui/src/NativeToast'
// import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
// import { ConvexProviderWithClerk } from 'convex/react-clerk'
// import { ConvexReactClient } from 'convex/react'
// import { tokenCache } from '@clerk/clerk-expo/token-cache'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'

// const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string)
// const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

// export const unstable_settings = {
//   // Ensure that reloading on `/user` keeps a back button present.
//   initialRouteName: 'Home',
// }

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync()

// export default function App() {
//   const [interLoaded, interError] = useFonts({
//     Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
//     InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
//   })

//   useEffect(() => {
//     if (interLoaded || interError) {
//       // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
//       SplashScreen.hideAsync()
//     }
//   }, [interLoaded, interError])

//   if (!interLoaded && !interError) {
//     return null
//   }

//   return <RootLayoutNav />
// }

// function RootLayoutNav() {
//   const colorScheme = useColorScheme()
//   const insets = useSafeAreaInsets()
//   return (
//     <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
//       <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
//         <Provider>
//           <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//             <Stack
//               screenOptions={{
//                 headerTransparent: true,
//               }}
//             />
//             <Stack.Screen
//               options={{
//                 title: 'Home',
//               }}
//             />
//             <NativeToast />
//           </ThemeProvider>
//         </Provider>
//       </ConvexProviderWithClerk>
//     </ClerkProvider>
//   )
// }
