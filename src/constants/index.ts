import Constants from "expo-constants";

import packageJson from "../../package.json";

export const IS_WEB = typeof window !== "undefined";
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_STAGING = process.env.NODE_ENV === "staging";
export const DOMAIN = "xlog.app";
export const VERSION = packageJson.version;
export const APP_SCHEME = Constants.expoConfig.scheme;
