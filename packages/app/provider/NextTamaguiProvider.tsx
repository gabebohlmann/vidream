// packages/app/provider/NextTamaguiProvider.tsx
'use client'

import '@tamagui/core/reset.css'
import '@tamagui/font-inter/css/400.css'
import '@tamagui/font-inter/css/700.css'
import '@tamagui/polyfill-dev' // Only for dev, consider conditional import for prod

import type { ReactNode } from 'react'
import { useEffect } from 'react'; // Added useEffect
import { useServerInsertedHTML } from 'next/navigation'
import { NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { config } from '@my/ui' // Your Tamagui compiled config from tamagui.config.ts
import { Provider } from 'app/provider' // This is your packages/app/provider/index.tsx
import { StyleSheet } from 'react-native'

export const NextTamaguiProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useRootTheme();

  // Log initial theme and any changes
  useEffect(() => {
    console.log('[NextTamaguiProvider] Theme from useRootTheme() DID UPDATE to:', theme);
  }, [theme]);
  console.log('[NextTamaguiProvider] Rendering with theme from useRootTheme():', theme);

  useServerInsertedHTML(() => {
    // @ts-ignore
    const rnwStyle = StyleSheet.getSheet();
    return (
      <>
        <link rel="stylesheet" href="/tamagui.css" />
        <style dangerouslySetInnerHTML={{ __html: rnwStyle.textContent }} id={rnwStyle.id} />
        <style
          dangerouslySetInnerHTML={{
            __html: config.getNewCSS(),
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: config.getCSS({
              exclude: process.env.NODE_ENV === 'production' ? 'design-system' : null,
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('t_unmounted')`,
          }}
        />
      </>
    );
  });

  return (
    <NextThemeProvider
      skipNextHead
      // Consider using "system" to better respect OS preference initially.
      // If using "system", ensure @tamagui/next-theme supports `enableSystem` or similar if needed.
      defaultTheme="system" // CHANGED to "system" for better OS integration
      // attribute="class" // Add if your Tamagui CSS relies on <html class="dark">
      // enableSystem // Add if @tamagui/next-theme's NextThemeProvider supports this for system preference
      onChangeTheme={(next) => {
        console.log('[NextTamaguiProvider] onChangeTheme (from NextThemeProvider) called with:', next);
        setTheme(next as any); // Update Tamagui's root theme state
      }}
    >
      {/* The `theme` variable from useRootTheme is passed as defaultTheme to your shared Provider */}
      {/* disableRootThemeClass is passed as true because NextThemeProvider typically handles the <html> class */}
      <Provider disableRootThemeClass={true} defaultTheme={theme}> 
        {children}
      </Provider>
    </NextThemeProvider>
  );
};