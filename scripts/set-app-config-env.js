const { join } = require("path");

const dotenv = require("dotenv");
const { cleanEnv, str } = require("envalid");

const { version } = require("../package.json");

const ENV = process.env.STAGE ?? "production";
const IS_EAS_CI = process.env.EAS_BUILD === "true";
if (IS_EAS_CI) {
  dotenv.config({ path: process.env.ENV_FILE_COMMON });
  dotenv.config({ path: process.env[`ENV_FILE_${ENV.toUpperCase()}`] });
}
else {
  dotenv.config({ path: join(__dirname, "..", ".env.common") });
  dotenv.config({ path: join(__dirname, "..", `.env.${ENV}`) });
}

const validators = {
  APP_SCHEME: str(),
  NAKED_APP_HOST: str(),
  APP_HOST: str(),
  NAKED_OIA_HOST: str(),
  OIA_HOST: str(),
};

if (IS_EAS_CI) {
  validators.ANDROID_GOOGLE_SERVICES_DEVELOPMENT = str();
  validators.ANDROID_GOOGLE_SERVICES_TEST = str();
  validators.ANDROID_GOOGLE_SERVICES_PRODUCTION = str();
  validators.IOS_GOOGLE_SERVICES_DEVELOPMENT = str();
  validators.IOS_GOOGLE_SERVICES_TEST = str();
  validators.IOS_GOOGLE_SERVICES_PRODUCTION = str();
}

const env = cleanEnv(process.env, validators);

function setAppConfigEnv() {
  const APP_SCHEME = env.APP_SCHEME;
  const NAKED_APP_HOST = env.NAKED_APP_HOST;
  const APP_HOST = env.APP_HOST;
  const NAKED_OIA_HOST = env.NAKED_OIA_HOST;
  const OIA_HOST = env.OIA_HOST;

  const envConfig = {
    development: {
      name: "xLog",
      nakedAppHost: NAKED_APP_HOST,
      appHost: APP_HOST,
      nakedOIAHost: NAKED_OIA_HOST,
      oiaHost: OIA_HOST,
      scheme: `${APP_SCHEME}.development`,
      icon: "./assets/icon.development.png",
      androidGoogleServicesFile: IS_EAS_CI
        ? process.env.ANDROID_GOOGLE_SERVICES_DEVELOPMENT
        : "./google-services.development.json",
      iosGoogleServicesFile: IS_EAS_CI
        ? process.env.IOS_GOOGLE_SERVICES_DEVELOPMENT
        : "./GoogleService-Info.development.plist",
    },
    test: {
      name: "xLog",
      nakedAppHost: NAKED_APP_HOST,
      appHost: APP_HOST,
      nakedOIAHost: NAKED_OIA_HOST,
      oiaHost: OIA_HOST,
      scheme: `${APP_SCHEME}.test`,
      icon: "./assets/icon.test.png",
      androidGoogleServicesFile: IS_EAS_CI
        ? process.env.ANDROID_GOOGLE_SERVICES_TEST
        : "./google-services.test.json",
      iosGoogleServicesFile: IS_EAS_CI
        ? process.env.IOS_GOOGLE_SERVICES_TEST
        : "./GoogleService-Info.test.plist",
    },
    production: {
      name: "xLog",
      nakedAppHost: NAKED_APP_HOST,
      appHost: APP_HOST,
      nakedOIAHost: NAKED_OIA_HOST,
      oiaHost: OIA_HOST,
      scheme: APP_SCHEME,
      icon: "./assets/icon.png",
      androidGoogleServicesFile: IS_EAS_CI
        ? process.env.ANDROID_GOOGLE_SERVICES_PRODUCTION
        : "./google-services.production.json",
      iosGoogleServicesFile: IS_EAS_CI
        ? process.env.IOS_GOOGLE_SERVICES_PRODUCTION
        : "./GoogleService-Info.production.plist",
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

  if (process.env.USING_GOOGLE_SERVICES !== "true") {
    delete envConfig[ENV].androidGoogleServicesFile;
    delete envConfig[ENV].iosGoogleServicesFile;
  }

  return {
    version,
    appConfig: envConfig[ENV],
    decreasedVersion: decrementVersion(version),
    environment: ENV,
    IS_DEV: ENV === "development",
    IS_TEST: ENV === "test",
    IS_PROD: ENV === "production",
  };
}

module.exports = setAppConfigEnv;
