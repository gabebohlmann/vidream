// packages/app/provider/index.tsx
import { DatePickerProvider } from '@rehookify/datepicker'
import { GlobalStoreProvider } from 'app/utils/global-store'
import React from 'react'
import { Platform } from 'react-native'
import { SafeAreaProvider } from './safe-area'
// import { TamaguiProvider as CustomTamaguiProviderWrapper } from './tamagui'; // See note below
import { UniversalThemeProvider } from './theme' // Your MODIFIED UniversalThemeProvider
import { ToastProvider } from './toast'

export { loadThemePromise } from './theme/UniversalThemeProvider'

// Helper to compose providers that go *inside* UniversalThemeProvider
const composeInnerProviders = (providers: React.FC<{ children: React.ReactNode }>[]) =>
  providers.reduce((Prev, Curr) => ({ children }) => {
    // Corrected variable name for the composed component
    const ComposedComponent = Prev ? (
      <Prev>
        <Curr>{children}</Curr>
      </Prev>
    ) : (
      <Curr>{children}</Curr>
    )
    return ComposedComponent
  })

// List of providers that should be nested within the themed Tamagui context
// established by UniversalThemeProvider.
const InnerProviders = composeInnerProviders([
  SafeAreaProvider,
  // CustomTamaguiProviderWrapper, // << LIKELY REMOVE THIS.
  // If UniversalThemeProvider now renders the CoreTamaguiProvider,
  // another TamaguiProvider here is usually incorrect.
  // Verify what 'app/provider/tamagui/index.tsx' does.
  // If it's just `export { TamaguiProvider } from 'tamagui'`, remove this line.
  ToastProvider,
  GlobalStoreProvider,
  // QueryClientProvider, // If you re-add React Query
])

export function Provider({
  children,
  defaultTheme, // This comes from NextTamaguiProvider on web, or could be undefined for native
  disableRootThemeClass,
}: {
  children: React.ReactNode
  defaultTheme?: string
  disableRootThemeClass?: boolean
}) {
  return (
    <DatePickerProvider config={{ selectedDates: [], onDatesChange: () => {} }}>
      <UniversalThemeProvider
        passedTheme={defaultTheme} // Pass the theme determined by web-specific logic (or native)
        disableRootThemeClass={disableRootThemeClass}
      >
        <InnerProviders>{children}</InnerProviders>
      </UniversalThemeProvider>
    </DatePickerProvider>
  )
}
