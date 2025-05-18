// apps/expo/app/index.tsx
import { Stack } from 'expo-router' // Import router
import { useRouter } from 'solito/router'
import { View, Button, Theme } from '@my/ui' // Basic React Native components

export default function HomeScreen() {
  const router = useRouter()

  const navigateToSignIn = () => {
    router.push('/(auth)/sign-in')
  }
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
        }}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ width: '80%' }}>
          <Theme inverse>
            <Button onPress={navigateToSignIn}>Sign In</Button>
          </Theme>
        </View>
      </View>
    </>
  )
}
