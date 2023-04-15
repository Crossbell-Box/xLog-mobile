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