// packages/app/provider/safe-area/use-safe-area.ts
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const useSafeArea = useSafeAreaInsets

// `export { useSafeAreaInsets as useSafeArea }` breaks autoimport, so do this instead
export { useSafeArea }
