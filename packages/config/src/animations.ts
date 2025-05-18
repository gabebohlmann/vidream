// packages/config/src/animations.ts
import { createAnimations } from '@tamagui/animations-react-native'

export const animations = createAnimations({
  '100ms': {
    type: 'timing',
    duration: 100,
  },
  '200ms': {
    type: 'timing',
    duration: 200,
  },
  bouncy: {
    type: 'spring',
    damping: 9,
    mass: 0.9,
    stiffness: 150,
  },
  lazy: {
    type: 'spring',
    damping: 18,
    stiffness: 50,
  },
  medium: {
    type: 'spring', // Added type
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
  slow: {
    type: 'spring', // Added type
    damping: 15,
    stiffness: 40,                
  },
  quick: {
    type: 'spring', // Added type
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  tooltip: {
    type: 'spring', // Added type
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
})
