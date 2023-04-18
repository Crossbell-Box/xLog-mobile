import 'node-libs-expo/globals'
import * as Random from 'expo-random';
 
// implement window.getRandomValues(), for packages that rely on it
if (typeof window === 'object') {
  if (!window.crypto) window.crypto = {}
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = async function getRandomValues (arr) {
      let orig = arr
      if (arr.byteLength != arr.length) {
        // Get access to the underlying raw bytes
        arr = new Uint8Array(arr.buffer)
      }
      const bytes = await Random.getRandomBytesAsync(arr.length)
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i]
      }
 
      return orig
    }
  }
}

import 'react-native-get-random-values'
import '@ethersproject/shims'

if (typeof BigInt === 'undefined') {
  global.BigInt = require('big-integer')
}

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

global.btoa = global.btoa || require('base-64').encode
global.atob = global.atob || require('base-64').decode

process.version = 'v9.40'
process.browser = false

// eslint-disable-next-line no-undef
const isDev = typeof __DEV__ === 'boolean' && __DEV__
process.env.NODE_ENV = isDev ? 'development' : 'production'