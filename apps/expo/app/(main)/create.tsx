// apps/expo/app/(main)/create.tsx
  // apps/expo/app/(main)/create.tsx
  import { View, Text, StyleSheet } from 'react-native'
  import CreateScreen from 'app/feautures/creat/screen'

  export default function CreatePage() {
    return <CreateScreen />
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
  })
