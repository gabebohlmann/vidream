// packages/app/provider/theme/UniversalThemeProvider.tsx
'use client' // For hooks like useNativeColorScheme and potential client-side logic

import React from 'react'
import { Platform, useColorScheme as useNativeColorScheme } from 'react-native'
import { TamaguiProvider as CoreTamaguiProvider, TamaguiProviderProps } from 'tamagui'
import { config } from '@my/ui' // Your generated Tamagui config (e.g., from tamagui.config.ts)

// Re-export these if other parts of your app consume them via this file,
// though NextTamaguiProvider is the primary consumer of useRootTheme now.
export { useRootTheme, useThemeSetting } from '@tamagui/next-theme'

interface UniversalThemeProviderProps {
  children: React.ReactNode
  // This prop will be passed from packages/app/provider/index.tsx,
  // which in turn gets it from NextTamaguiProvider on the web.
  passedTheme?: string // e.g., 'light' or 'dark'
  disableRootThemeClass?: boolean
}

export const UniversalThemeProvider = ({
  children,
  passedTheme,
  disableRootThemeClass,
}: UniversalThemeProviderProps) => {
  let currentTheme: string

  if (Platform.OS === 'web') {
    // On web, we prioritize the theme passed down, which originates from useRootTheme()
    // in NextTamaguiProvider.
    currentTheme = passedTheme || 'light' // Fallback to 'light' if nothing passed
  } else {
    // Native: use react-native's useColorScheme
    const nativeColorScheme = useNativeColorScheme()
    currentTheme = nativeColorScheme === 'dark' ? 'dark' : 'light'
  }

  return (
    <CoreTamaguiProvider
      config={config}
      defaultTheme={currentTheme}
      // On web, if @tamagui/next-theme (via NextThemeProvider) handles the class on <html>,
      // then the TamaguiProvider here should disable its own root class management.
      disableRootThemeClass={Platform.OS === 'web' ? (disableRootThemeClass ?? true) : false}
      // You can add other TamaguiProviderProps here if needed, for example:
      // themeClassNameOnRoot={Platform.OS !== 'web'} // Only apply theme class on root for native
    >
      {children}
    </CoreTamaguiProvider>
  )
}

// This promise likely isn't doing much for dynamic theming if it resolves immediately.
// Actual theme loading might be handled by CSS imports or Tamagui's internal mechanisms.
export const loadThemePromise = new Promise<any>((res) => res({}))
