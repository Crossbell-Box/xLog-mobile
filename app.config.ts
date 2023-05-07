import * as dotenv from "dotenv";
import type { ExpoConfig, ConfigContext } from "expo/config";

import { version } from "./package.json";

dotenv.config({ path: ".env.common" });
if (process.env.NODE_ENV) {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
}

export default (_: ConfigContext): ExpoConfig => {
  return {
    name: "xLog",
    description: "The first on-chain and open-source blogging platform for everyone",
    slug: "xlog",
    version,
    scheme: process.env.APP_SCHEME,
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
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: [
      "**/*",
    ],
    updates: {
      url: process.env.UPDATES_URL,
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.BUNDLE_IDENTIFIER,
    },
    android: {
      package: process.env.BUNDLE_IDENTIFIER,
    },
    extra: {
      WALLET_PROJECT_ID: process.env.WALLET_PROJECT_ID,
      INFURA_ID: process.env.INFURA_ID,
      eas: {
        projectId: process.env.EXPO_PROJECT_ID,
      },
    },
    owner: process.env.OWNER,
  };
};
