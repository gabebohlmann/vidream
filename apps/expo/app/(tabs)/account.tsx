import { View, Text, StyleSheet } from 'react-native'
import SignInPage from '../(auth)/sign-in'

export default function AccountPage() {
  return <SignInPage />
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
