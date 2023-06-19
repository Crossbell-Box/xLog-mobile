import Constants from "expo-constants";

import { ENV } from "./env";

import packageJson from "../../package.json";

export const IS_WEB = typeof window !== "undefined";
export const IS_PROD = ENV === "production";
export const IS_DEV = ENV === "development";
export const IS_STAGING = ENV === "staging";
export const DOMAIN = "xlog.app";
export const VERSION = packageJson.version;
export const APP_SCHEME = Constants.expoConfig.scheme;
