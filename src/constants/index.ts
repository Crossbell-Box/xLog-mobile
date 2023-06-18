import packageJson from "../../package.json";

export const IS_WEB = typeof window !== "undefined";
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_DEV = process.env.NODE_ENV === "development";
export const DOMAIN = "xlog.app";
export const VERSION = packageJson.version;
