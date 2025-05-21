// apps/expo/app/(auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ title: 'Sign In', headerShown: true }} />
      <Stack.Screen name="sign-up" options={{ title: 'Sign Up', headerShown: true }} />
      <Stack.Screen
        name="reset-password"
        options={{ title: 'Reset Password', headerShown: true }}
      />
    </Stack>
  )
}
