/* eslint-disable no-console */
import * as dotenv from "dotenv";
import type { ExpoConfig, ConfigContext } from "expo/config";

import { version } from "./package.json";

const ENV = process.env.NODE_ENV ?? "production";

if (process.env.EAS_BUILD === "true") {
  dotenv.config({ path: process.env.ENV_FILE_COMMON });
  dotenv.config({ path: process.env[`ENV_FILE_${ENV.toUpperCase()}`] });
}
else {
  dotenv.config({ path: ".env.common" });
  dotenv.config({ path: `.env.${ENV}` });
}

console.log("ENV:", ENV);

const SCHEME = process.env.APP_SCHEME;
const HOST = process.env.APP_HOST;

const envConfig = {
  development: {
    name: "xLog-dev",
    host: HOST,
    scheme: `${SCHEME}.development`,
    icon: "./assets/icon.development.png",
  },
  staging: {
    name: "xLog-preview",
    host: HOST,
    scheme: `${SCHEME}.staging`,
    icon: "./assets/icon.staging.png",
  },
  production: {
    name: "xLog",
    host: HOST,
    scheme: SCHEME,
    icon: "./assets/icon.png",
  },
};

const config = envConfig[ENV] as typeof envConfig[keyof typeof envConfig];

console.log(JSON.stringify(config, null, 4));

export default (_: ConfigContext): ExpoConfig => {
  return {
    name: config.name,
    description: "The first on-chain and open-source blogging platform for everyone",
    slug: "xlog",
    version,
    scheme: config.scheme,
    orientation: "portrait",
    icon: config.icon,
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
            kotlinVersion: "1.6.21",
          },
          ios: {
            deploymentTarget: "13.0",
          },
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
          isAccessMediaLocationEnabled: true,
        },
      ],
      "expo-localization",
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
      policy: "appVersion",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: config.scheme,
      associatedDomains: [
        `applinks:${config.host}`,
        `applinks:oia.${config.host}`,
      ],
    },
    android: {
      package: config.scheme,
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              host: `*.${config.host}`,
              pathPrefix: "/",
            },
            {
              scheme: "https",
              host: `oia.${config.host}`,
              pathPrefix: "/",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    extra: {
      WALLET_PROJECT_ID: process.env.WALLET_PROJECT_ID,
      INFURA_ID: process.env.INFURA_ID,
      CSB_SCAN: process.env.CSB_SCAN,
      CSB_XCHAR: process.env.CSB_XCHAR,
      APP_HOST: config.host,
      eas: {
        projectId: process.env.EXPO_PROJECT_ID,
      },
    },
    owner: process.env.OWNER,
  };
};
