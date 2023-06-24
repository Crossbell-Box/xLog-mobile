const dotenv = require("dotenv");

const { version } = require("../package.json");

const ENV = process.env.NODE_ENV ?? "production";

if (process.env.EAS_BUILD === "true") {
  dotenv.config({ path: process.env.ENV_FILE_COMMON });
  dotenv.config({ path: process.env[`ENV_FILE_${ENV.toUpperCase()}`] });
}
else {
  dotenv.config({ path: ".env.common" });
  dotenv.config({ path: `.env.${ENV}` });
}

console.log("ENV:", ENV);

const SCHEME = process.env.APP_SCHEME;
const HOST = process.env.APP_HOST;

const envConfig = {
  development: {
    name: "xLog-dev",
    host: HOST,
    scheme: `${SCHEME}.development`,
    icon: "./assets/icon.development.png",
  },
  staging: {
    name: "xLog-preview",
    host: HOST,
    scheme: `${SCHEME}.staging`,
    icon: "./assets/icon.staging.png",
  },
  production: {
    name: "xLog",
    host: HOST,
    scheme: SCHEME,
    icon: "./assets/icon.png",
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

module.exports = {
  appConfig: envConfig[ENV],
  version,
  environment: ENV,
  decreasedVersion: decrementVersion(version),
};
