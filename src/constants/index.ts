import { Platform } from "react-native";

import Constants from "expo-constants";

import { ENV } from "./env";

import packageJson from "../../package.json";

export const IS_WEB = typeof window !== "undefined";
export const IS_PROD = ENV === "production";
export const IS_DEV = ENV === "development";
export const IS_TEST = ENV === "test";
export const DOMAIN = "xlog.app";
export const VERSION = packageJson.version;
export const APP_SCHEME = Constants.expoConfig.scheme;
export const IS_IOS = Platform.OS === "ios";
export const IS_ANDROID = Platform.OS === "android";
