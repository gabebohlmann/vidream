// packages/app/provider/theme/UniversalThemeProvider.native.tsx
import { useIsomorphicLayoutEffect } from '@my/ui'; // Assuming this correctly maps to useLayoutEffect on native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { TamaguiProvider as CoreTamaguiProvider } from 'tamagui'; // Import core TamaguiProvider
import { config } from '@my/ui'; // Your Tamagui config from tamagui.config.ts
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme as useNativeColorScheme, Platform } from 'react-native'; // Added Platform

// Type for the custom theme context, mirroring @tamagui/next-theme's API
type CustomThemeContextValue = {
  current?: string | null;
  themes: string[];
  onChangeTheme?: (next: string) => void;
  systemTheme: 'light' | 'dark'; // Ensure this is always light or dark
  resolvedTheme: 'light' | 'dark'; // Ensure this is always light or dark
  set?: (value: string) => void;
  toggle?: () => void;
};
export const ThemeContext = createContext<CustomThemeContextValue | null>(null);

type ThemeName = 'light' | 'dark' | 'system';

// --- Theme Persistence Logic ---
let persistedTheme: ThemeName | null = null;
let persistencePromiseResolved = false;
export const loadThemePromise = AsyncStorage.getItem('@preferred_theme')
  .then((val) => {
    persistedTheme = val as ThemeName;
    return persistedTheme;
  })
  .finally(() => {
    persistencePromiseResolved = true;
  });
// --- End Theme Persistence Logic ---

export const UniversalThemeProvider = ({
  children,
  // These props come from packages/app/provider/index.tsx
  // `passedTheme` will be undefined on native, `disableRootThemeClass` is mostly for web
  passedTheme, // Will be undefined on native
  disableRootThemeClass 
}: {
  children: React.ReactNode;
  passedTheme?: string; 
  disableRootThemeClass?: boolean;
}) => {
  const osColorScheme = useNativeColorScheme() || 'light'; // Default to 'light' if null
  const [userPreferredTheme, setUserPreferredTheme] = useState<ThemeName | null>(
    // Initialize with persistedTheme if already resolved by the time of first render
    persistencePromiseResolved ? (persistedTheme ?? 'system') : null
  );

  // Load theme from AsyncStorage on initial mount if not already loaded
  useIsomorphicLayoutEffect(() => {
    if (!persistencePromiseResolved) {
      loadThemePromise.then((loadedTheme) => {
        setUserPreferredTheme(loadedTheme ?? 'system');
      });
    }
  }, []);

  // Persist user's preference when it changes
  useEffect(() => {
    if (userPreferredTheme) {
      if (userPreferredTheme === 'system') {
        AsyncStorage.removeItem('@preferred_theme');
      } else {
        AsyncStorage.setItem('@preferred_theme', userPreferredTheme);
      }
    }
  }, [userPreferredTheme]);

  // Determine the actual theme to apply ('light' or 'dark')
  const actualTheme = useMemo((): 'light' | 'dark' => {
    if (userPreferredTheme && userPreferredTheme !== 'system') {
      return userPreferredTheme;
    }
    return osColorScheme; // osColorScheme is already 'light' or 'dark'
  }, [userPreferredTheme, osColorScheme]);

  // Value for your custom ThemeContext (for useThemeSettingLocal, useRootThemeLocal)
  const themeContextValue = useMemo<CustomThemeContextValue>(() => ({
    themes: ['light', 'dark'], // Available manual themes
    current: userPreferredTheme ?? 'system', // What the user has set ('light', 'dark', or 'system')
    systemTheme: osColorScheme, // The OS's current theme
    resolvedTheme: actualTheme, // The theme actually being applied
    onChangeTheme: (nextThemeName: string) => setUserPreferredTheme(nextThemeName as ThemeName),
    set: (themeName: string) => setUserPreferredTheme(themeName as ThemeName),
    toggle: () => {
      const map: Record<ThemeName, ThemeName> = { light: 'dark', dark: 'system', system: 'light' };
      setUserPreferredTheme(map[userPreferredTheme ?? 'system']);
    },
  }), [userPreferredTheme, osColorScheme, actualTheme]);


  // Don't render children until the theme preference is loaded from AsyncStorage
  // to prevent theme flash or rendering with a wrong initial theme.
  if (userPreferredTheme === null && !persistencePromiseResolved) {
    return null; // Or a loading spinner if preferred
  }
  


  return (
    <ThemeContext.Provider value={themeContextValue}>
      <CoreTamaguiProvider
        config={config} // This MUST be your valid compiled Tamagui config object
        defaultTheme={actualTheme}
        // On native, Tamagui might set props on the root view or use class names differently.
        // disableRootThemeClass is typically false or undefined for native unless you have specific needs.
        disableRootThemeClass={false} 
        // themeClassNameOnRoot={true} // Check Tamagui docs if this is needed for native theming
      >
        <NavigationThemeProvider value={actualTheme === 'dark' ? DarkTheme : DefaultTheme}>
          {/* <StatusBar style={actualTheme === 'dark' ? 'dark' : 'light'} /> */}
          {children}
        </NavigationThemeProvider>
      </CoreTamaguiProvider>
    </ThemeContext.Provider>
  );
};


// Your custom hooks (useThemeSetting, useRootTheme) for native, using your ThemeContext
// Renamed to avoid potential conflicts if importing from @tamagui/next-theme in shared files.
export const useThemeSettingLocal = (): CustomThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettingLocal must be used within UniversalThemeProvider (native)');
  }
  return context;
};

export const useRootThemeLocal = (): [string, (themeName: string) => void] => {
  const context = useThemeSettingLocal();
  // Ensure 'set' and 'resolvedTheme' are part of your CustomThemeContextValue and are defined
  if (!context.set || typeof context.resolvedTheme === 'undefined') {
    throw new Error('Theme context is not fully initialized for useRootThemeLocal.');
  }
  return [context.resolvedTheme, context.set];
};