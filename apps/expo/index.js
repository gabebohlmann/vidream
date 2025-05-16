// apps/expo/index.js
import 'setimmediate'

if (!global?.setImmediate) {
  global.setImmediate = setTimeout
}

import 'expo-router/entry'
