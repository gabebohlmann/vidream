// packages/app/provider/index.tsx
// import { DatePickerProvider } from '@rehookify/datepicker'
// // import { Session } from '@supabase/supabase-js'
// import { GlobalStoreProvider } from 'app/utils/global-store'
// import React from 'react'

// // import { AuthProvider } from './auth'
// // import { QueryClientProvider } from './react-query'
// import { SafeAreaProvider } from './safe-area'
// import { TamaguiProvider } from './tamagui'
// import { UniversalThemeProvider } from './theme'
// import { ToastProvider } from './toast'

// export { loadThemePromise } from './theme/UniversalThemeProvider'

// export function Provider({
//   initialSession,
//   children,
// }: {
//   initialSession?: Session | null
//   children: React.ReactNode
// }) {
//   return (
//     // Note: DatePickerProvider Conflicted with Popover so this is just a temporary solution
//     <DatePickerProvider config={{ selectedDates: [], onDatesChange: () => {} }}>
//       {/* <AuthProvider initialSession={initialSession}> */}
//         <Providers>{children}</Providers>
//       {/* </AuthProvider> */}
//     </DatePickerProvider>
//   )
// }

// const compose = (providers: React.FC<{ children: React.ReactNode }>[]) =>
//   providers.reduce((Prev, Curr) => ({ children }) => {
//     const Provider = Prev ? (
//       <Prev>
//         <Curr>{children}</Curr>
//       </Prev>
//     ) : (
//       <Curr>{children}</Curr>
//     )
//     return Provider
//   })

// const Providers = compose([x
//   UniversalThemeProvider,
//   SafeAreaProvider,
//   TamaguiProvider,
//   ToastProvider,
//   // QueryClientProvider,
//   GlobalStoreProvider,
// ])

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// import { useColorScheme } from 'react-native'
// import {
//   CustomToast,
//   TamaguiProvider,
//   type TamaguiProviderProps,
//   ToastProvider,
//   config,
//   isWeb,
// } from '@my/ui'
// import { ToastViewport } from './ToastViewport'
// import { useEffect, useState } from 'react' // Import useState and useEffect

// export function Provider({
//   children,
//   defaultTheme: initialThemeFromProp = 'light', // Renamed for clarity; this comes from NextTamaguiProvider on web
//   ...rest
// }: Omit<TamaguiProviderProps, 'config'> & { defaultTheme?: string }) {
//   const systemColorScheme = useColorScheme() // 'light', 'dark', or null

//   // Initialize state: on web, use the prop; on native, use the system scheme.
//   const [currentTheme, setCurrentTheme] = useState(
//     isWeb ? initialThemeFromProp : systemColorScheme === 'dark' ? 'dark' : 'light'
//   )

//   // Effect for Native: Update Tamagui theme when system color scheme changes.
//   useEffect(() => {
//     if (!isWeb) {
//       const newTheme = systemColorScheme === 'dark' ? 'dark' : 'light'
//       if (newTheme !== currentTheme) {
//         setCurrentTheme(newTheme)
//       }
//     }
//   }, [systemColorScheme, isWeb, currentTheme])

//   // Effect for Web: Update Tamagui theme if the prop from NextTamaguiProvider changes.
//   useEffect(() => {
//     if (isWeb) {
//       if (initialThemeFromProp !== currentTheme) {
//         setCurrentTheme(initialThemeFromProp)
//       }
//     }
//   }, [initialThemeFromProp, isWeb, currentTheme])

//   return (
//     // By passing `currentTheme` to the `theme` prop of TamaguiProvider,
//     // Tamagui will reactively update the theme for its children.
//     // Using `key` can also help force re-renders if `theme` prop change alone isn't sufficient,
//     // but usually `theme` prop is the correct way.
//     <TamaguiProvider
//       config={config}
//       defaultTheme={currentTheme} // Sets the initial theme
//       theme={currentTheme} // Explicitly sets the current theme, making it reactive
//       // key={currentTheme}       // Uncomment if direct `theme` prop update isn't enough
//       {...rest}
//     >
//       <ToastProvider swipeDirection="horizontal" duration={6000} native={isWeb ? [] : ['mobile']}>
//         {children}
//         <CustomToast />
//         <ToastViewport />
//       </ToastProvider>
//     </TamaguiProvider>
//   )
// }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import { useColorScheme } from 'react-native'
// import {
//   CustomToast,
//   TamaguiProvider,
//   type TamaguiProviderProps,
//   ToastProvider,
//   config,
//   isWeb,
// } from '@my/ui'
// import { ToastViewport } from './ToastViewport'

// export function Provider({
//   children,
//   defaultTheme = 'light',
//   ...rest
// }: Omit<TamaguiProviderProps, 'config'> & { defaultTheme?: string }) {
//   const colorScheme = useColorScheme()
//   const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light')

//   return (
//     <TamaguiProvider config={config} defaultTheme={theme} {...rest}>
//       <ToastProvider swipeDirection="horizontal" duration={6000} native={isWeb ? [] : ['mobile']}>
//         {children}
//         <CustomToast />
//         <ToastViewport />
//       </ToastProvider>
//     </TamaguiProvider>
//   )
// }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// packages/app/provider/index.tsx
// import { useColorScheme } from 'react-native'
// import {
//   CustomToast,
//   // TamaguiProvider,
//   type TamaguiProviderProps,
//   ToastProvider,
//   isWeb,
// } from '@my/ui'
// import { ToastViewport } from './ToastViewport'
// import { config } from '@my/config'

// // import { AuthProvider } from './auth'
// // import { QueryClientProvider } from './react-query'
// import { SafeAreaProvider } from './safe-area'
// import { TamaguiProvider } from './tamagui'
// import { UniversalThemeProvider } from './theme'
// // import { ToastProvider } from './toast'

// export { loadThemePromise } from './theme/UniversalThemeProvider'

// export function Provider({
//   children,
//   defaultTheme = 'light',
//   ...rest
// }: Omit<TamaguiProviderProps, 'config'> & { defaultTheme?: string }) {
//   const colorScheme = useColorScheme()
//   const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light')

//   return (
//     <TamaguiProvider config={config} defaultTheme={theme} {...rest}>
//       <ToastProvider swipeDirection="horizontal" duration={6000} native={isWeb ? [] : ['mobile']}>
//         {children}
//         <CustomToast />
//         <ToastViewport />
//       </ToastProvider>
//     </TamaguiProvider>
//   )
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// packages/app/provider/index.tsx
import { DatePickerProvider } from '@rehookify/datepicker'
// import { Session } from '@supabase/supabase-js'
import { GlobalStoreProvider } from 'app/utils/global-store'
import React from 'react'

// import { AuthProvider } from './auth'
// import { QueryClientProvider } from './react-query'
import { SafeAreaProvider } from './safe-area'
import { TamaguiProvider } from './tamagui'
import { UniversalThemeProvider } from './theme'
import { ToastProvider } from './toast'

export { loadThemePromise } from './theme/UniversalThemeProvider'

export function Provider({
  // initialSession,
  children,
}: {
  // initialSession?: Session | null
  children: React.ReactNode
}) {
  return (
    // Note: DatePickerProvider Conflicted with Popover so this is just a temporary solution
    <DatePickerProvider config={{ selectedDates: [], onDatesChange: () => {} }}>
      {/* <AuthProvider initialSession={initialSession}> */}
        <Providers>{children}</Providers>
      {/* </AuthProvider> */}
    </DatePickerProvider>
  )
}

const compose = (providers: React.FC<{ children: React.ReactNode }>[]) =>
  providers.reduce((Prev, Curr) => ({ children }) => {
    const Provider = Prev ? (
      <Prev>
        <Curr>{children}</Curr>
      </Prev>
    ) : (
      <Curr>{children}</Curr>
    )
    return Provider
  })

const Providers = compose([
  UniversalThemeProvider,
  SafeAreaProvider,
  TamaguiProvider,
  ToastProvider,
  // QueryClientProvider,
  GlobalStoreProvider,
])

