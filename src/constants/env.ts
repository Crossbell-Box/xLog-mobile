/* eslint-disable no-console */
import Constants from "expo-constants";

export const INFURA_ID = Constants.expoConfig.extra?.INFURA_ID;
export const SENTRY_DSN = Constants.expoConfig.extra?.SENTRY_DSN;
export const WALLET_PROJECT_ID = Constants.expoConfig.extra?.WALLET_PROJECT_ID;
export const IPFS_GATEWAY = "https://ipfs.crossbell.io/ipfs/";
export const WALLET_RELAY_URL = "wss://relay.walletconnect.com";
export const CSB_SCAN = Constants.expoConfig.extra?.CSB_SCAN || "https://scan.crossbell.io";
export const CSB_XCHAR = Constants.expoConfig.extra?.CSB_XCHAR || "https://xchar.app";
export const ENV = Constants.expoConfig.extra?.ENV || "production";
export const NAKED_APP_HOST = Constants.expoConfig.extra?.NAKED_APP_HOST || "xlog.app";
export const APP_HOST = Constants.expoConfig.extra?.APP_HOST || "https://xlog.app";
export const NAKED_AIO_HOST = Constants.expoConfig.extra?.NAKED_AIO_HOST || "oia.xlog.app";
export const AIO_HOST = Constants.expoConfig.extra?.AIO_HOST || "https://oia.xlog.app";
console.log("HOST LIST: ", {
  APP_HOST,
  NAKED_APP_HOST,
  AIO_HOST,
  NAKED_AIO_HOST,
});
console.log("Current ENV: ", ENV);
export const EXPO_PROJECT_ID = Constants.expoConfig.extra?.eas?.projectId;
