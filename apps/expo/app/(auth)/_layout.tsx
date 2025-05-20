// apps/expo/app/(auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="sign-in"
        options={{ title: 'Sign In', presentation: 'modal', headerShown: true }}
      />
      <Stack.Screen
        name="sign-up"
        options={{ title: 'Sign Up', presentation: 'modal', headerShown: true }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ title: 'Reset Password', presentation: 'modal', headerShown: true }}
      />
    </Stack>
  )
}
