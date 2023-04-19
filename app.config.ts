import * as dotenv from 'dotenv'
import { ExpoConfig, ConfigContext } from 'expo/config';
import { version } from "./package.json";

dotenv.config({ path: '.env.common' })
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: "xLog",
    description: "The first on-chain and open-source blogging platform for everyone",
    slug: "xlog",
    version,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 33,
            targetSdkVersion: 33,
            minSdkVersion: 23,
            buildToolsVersion: "33.0.0",
            kotlinVersion: "1.6.20",
          },
          ios: {
            deploymentTarget: "13.0",
          },
        },
      ],
    ],
    splash: {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    updates: {
      url: process.env.UPDATES_URL
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.BUNDLE_IDENTIFIER,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: process.env.BUNDLE_IDENTIFIER
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID,
      }
    },
    owner: process.env.OWNER
  }
}