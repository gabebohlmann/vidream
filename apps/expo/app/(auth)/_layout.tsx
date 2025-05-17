// apps/expo/app/(auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack />
    </>
  )
}
