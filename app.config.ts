import * as dotenv from 'dotenv'
import { ExpoConfig, ConfigContext } from 'expo/config';

dotenv.config({ path: '.env.common' })
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export default ({ config }: ConfigContext): ExpoConfig => {

  return {
    "name": "xLog",
    "description": "The first on-chain and open-source blogging platform for everyone",
    "slug": "xlog",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": process.env.BUNDLE_IDENTIFIER
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": process.env.BUNDLE_IDENTIFIER
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": process.env.EXPO_PROJECT_ID,
      }
    },
    "owner": "crossbell"
  }
}