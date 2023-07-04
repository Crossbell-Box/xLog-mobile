const dotenv = require("dotenv");

const { version } = require("../package.json");

function setAppConfigEnv() {
  const ENV = process.env.NODE_ENV ?? "production";
  const IS_CI = process.env.EAS_BUILD === "true" || process.env.CI === "true";

  console.log("ENV:", process.env);

  if (IS_CI) {
    dotenv.config({ path: process.env.ENV_FILE_COMMON });
    dotenv.config({ path: process.env[`ENV_FILE_${ENV.toUpperCase()}`] });
  }
  else {
    dotenv.config({ path: ".env.common" });
    dotenv.config({ path: `.env.${ENV}` });
  }

  console.log("ENV:", ENV);

  const SCHEME = process.env.APP_SCHEME;
  const HOST = process.env.APP_HOST ?? "xlog.app";

  const envConfig = {
    development: {
      name: "xLog-dev",
      host: HOST,
      scheme: `${SCHEME}.development`,
      icon: "./assets/icon.development.png",
      androidGoogleServicesFile: IS_CI ? process.env.ANDROID_GOOGLE_SERVICES_DEVELOPMENT : "./google-services.development.json",
      iosGoogleServicesFile: IS_CI ? process.env.IOS_GOOGLE_SERVICES_DEVELOPMENT : "./GoogleService-Info.development.plist",
    },
    staging: {
      name: "xLog-preview",
      host: HOST,
      scheme: `${SCHEME}.staging`,
      icon: "./assets/icon.staging.png",
      androidGoogleServicesFile: IS_CI ? process.env.ANDROID_GOOGLE_SERVICES_STAGING : "./google-services.staging.json",
      iosGoogleServicesFile: IS_CI ? process.env.IOS_GOOGLE_SERVICES_STAGING : "./GoogleService-Info.staging.plist",
    },
    production: {
      name: "xLog",
      host: HOST,
      scheme: SCHEME,
      icon: "./assets/icon.png",
      androidGoogleServicesFile: IS_CI ? process.env.ANDROID_GOOGLE_SERVICES_PRODUCTION : "./google-services.production.json",
      iosGoogleServicesFile: IS_CI ? process.env.IOS_GOOGLE_SERVICES_PRODUCTION : "./GoogleService-Info.production.plist",
    },
  };

  /**
 * Ignoring patch version
 * @example 1.1.1 -> 1.1.0 / 4.2.1 -> 4.2.0
 * */
  function decrementVersion(version) {
    const parts = version.split(".");
    parts[parts.length - 1] = "0";
    return parts.join(".");
  }

  return {
    version,
    appConfig: envConfig[ENV],
    decreasedVersion: decrementVersion(version),
    environment: ENV,
  };
}

module.exports = setAppConfigEnv;
