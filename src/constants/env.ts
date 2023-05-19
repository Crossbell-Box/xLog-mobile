import Constants from "expo-constants";

export const IPFS_GATEWAY = "https://ipfs.4everland.xyz/ipfs/";
export const WALLET_RELAY_URL = "wss://relay.walletconnect.com";
export const WALLET_PROJECT_ID = Constants.expoConfig.extra?.WALLET_PROJECT_ID;
export const INFURA_ID = Constants.expoConfig.extra?.INFURA_ID;
export const CSB_SCAN = process.env.CSB_SCAN || "https://scan.crossbell.io";
export const CSB_XCHAR = process.env.CSB_XCHAR || "https://xchar.app";
