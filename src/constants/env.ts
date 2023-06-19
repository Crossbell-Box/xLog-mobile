import Constants from "expo-constants";

export const INFURA_ID = Constants.expoConfig.extra?.INFURA_ID;
export const SENTRY_DSN = Constants.expoConfig.extra?.SENTRY_DSN;
export const WALLET_PROJECT_ID = Constants.expoConfig.extra?.WALLET_PROJECT_ID;
export const IPFS_GATEWAY = "https://ipfs.4everland.xyz/ipfs/";
export const WALLET_RELAY_URL = "wss://relay.walletconnect.com";
export const CSB_SCAN = Constants.expoConfig.extra?.CSB_SCAN || "https://scan.crossbell.io";
export const CSB_XCHAR = Constants.expoConfig.extra?.CSB_XCHAR || "https://xchar.app";
export const APP_HOST = Constants.expoConfig.extra?.APP_HOST || "xlog.app";
export const ENV = Constants.expoConfig.extra?.ENV || "production";
