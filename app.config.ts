import type { ExpoConfig, ConfigContext } from "expo/config";

import setAppConfigEnv from "./scripts/set-app-config-env.js";

const { appConfig, environment, decreasedVersion } = setAppConfigEnv();

const config = appConfig;

// eslint-disable-next-line no-console
console.log(JSON.stringify(config, null, 4));

const postPublish = [];

if (environment !== "development") {
  postPublish.push({
    file: "sentry-expo/upload-sourcemaps",
    config: {
      setCommit: true,
      organization: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  });
}

export default (_: ConfigContext): ExpoConfig => {
  return {
    name: config.name,
    description: "The first on-chain and open-source blogging platform for everyone",
    slug: "xlog",
    version: decreasedVersion,
    scheme: config.scheme,
    orientation: "portrait",
    icon: config.icon,
    userInterfaceStyle: "automatic",
    hooks: {
      postPublish,
    },
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
      "sentry-expo",
      ...process.env.USING_GOOGLE_SERVICES === "true" ? ["@react-native-firebase/app"] : [],
      "./plugins/with-react-native-firebase.js",
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
      googleServicesFile: config.iosGoogleServicesFile,
    },
    android: {
      package: config.scheme,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: `${config.host}`,
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
      googleServicesFile: config.androidGoogleServicesFile,
    },
    extra: {
      WALLET_PROJECT_ID: process.env.WALLET_PROJECT_ID,
      INFURA_ID: process.env.INFURA_ID,
      CSB_SCAN: process.env.CSB_SCAN,
      CSB_XCHAR: process.env.CSB_XCHAR,
      SENTRY_DSN: process.env.SENTRY_DSN,
      APP_HOST: config.host,
      ENV: environment,
      eas: {
        projectId: process.env.EXPO_PROJECT_ID,
      },
    },
    owner: process.env.OWNER,
  };
};
