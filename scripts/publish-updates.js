const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const { appConfig, environment, version } = require("./app-config");

console.log("ENV:", environment);

const scheme = appConfig.scheme;
const sourceMapDir = path.join(process.cwd(), "dist", "bundles");
const sentryCli = path.join(process.cwd(), "node_modules", "@sentry", "cli", "bin", "sentry-cli");
const childProcessEnv = Object.assign({}, process.env, {
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_URL: "https://sentry.io/",
});

const createReleaseName = (platform, versionInfo) => {
  return `${versionInfo.identifier}@${versionInfo.version}+${platform === "android" ? versionInfo.versionCode : versionInfo.buildNumber}`;
};

function getVersionInfo() {
  return new Promise((resolve) => {
    let versionInfo = {};

    const child = spawn("eas", ["build:version:get", "--platform=all", "--non-interactive", "--json", "--profile=production"]);

    child.stdout.on("data", (data) => {
      if (data) {
        versionInfo = JSON.parse(String(data));
      }
      console.log(`[Getting Version Info] ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`\x1B[31m[Getting Version Info] ${data}\x1B[0m`);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      resolve(versionInfo);
    });
  });
}

function publishUpdates() {
  return new Promise((resolve) => {
    let isPublished = false;
    let _updateInfo = {
      androidUpdateId: undefined,
      iosUpdateId: undefined,
    };

    const channel = {
      staging: "preview",
      production: "production",
    }[process.env.NODE_ENV];

    const child = spawn("eas", ["update", "--non-interactive", "--channel", channel, "--auto"]);

    function parseUpdateInfo(infoString) {
      const lines = infoString.split("\n");
      const androidLine = lines.find(line => line.includes("Android update ID"));
      const iosLine = lines.find(line => line.includes("iOS update ID"));

      const androidUpdateId = androidLine ? androidLine.split("Android update ID")[1].trim() : undefined;
      const iosUpdateId = iosLine ? iosLine.split("iOS update ID")[1].trim() : undefined;

      if (!androidUpdateId && !iosUpdateId) {
        return undefined;
      }

      return {
        androidUpdateId,
        iosUpdateId,
      };
    }

    child.stdout.on("data", (_data) => {
      const data = String(_data);
      console.log(`[Publishing Updates] ${data}`);

      if (data.includes("Published!")) {
        isPublished = true;
      }
      const updateInfo = parseUpdateInfo(data);
      if (isPublished && updateInfo) {
        _updateInfo = updateInfo;
      }
    });

    child.stderr.on("data", (data) => {
      console.error(`\x1B[31m[Publishing Updates] ${data}\x1B[0m`);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      resolve(_updateInfo);
    });
  });
}

function extensionsForPlatform(platform = "") {
  if (platform === "android") {
    return ["--ext", "bundle", "--ext", "map", "--ignore", "main.jsbundle.map"];
  }
  else if (platform === "ios") {
    return ["--ext", "jsbundle", "--ext", "map", "--ignore", "index.android.bundle.map"];
  }
  else {
    // Otherwise let's just pass in all the sourcemap files
    return ["--ext", "jsbundle", "--ext", "bundle", "--ext", "map"];
  }
}

async function uploadSourceMaps(platform, versionInfo) {
  const updateId = versionInfo[`${platform}UpdateId`];
  const release = createReleaseName(platform, versionInfo);
  console.log(`[Uploading source maps] Uploading source maps for release ${release} [${platform}]`);
  const argumentsList = [
    "releases",
    "files",
    release,
    "upload-sourcemaps",
    ".",
    ...extensionsForPlatform(platform),
    "--rewrite",
    "--dist",
    updateId,
    "--strip-prefix",
    process.cwd(),
  ];

  console.log("[Uploading source maps] Uploading source maps with arguments:", `${sentryCli} ${argumentsList.join(" ")}`);

  const child = spawn(sentryCli, argumentsList, {
    cwd: sourceMapDir,
    env: childProcessEnv,
  });

  child.stdout.on("data", data => console.log(`[Uploading source maps] ${data}`));
  child.stderr.on("data", data => console.error(`\x1B[31m[Uploading source maps] ${data}\x1B[0m`));

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`sentry-cli exited with code ${code}`));
      }
      resolve();
    });
  });
}

async function finalizeRelease(platform, versionInfo) {
  const release = createReleaseName(platform, versionInfo);
  console.log(`[Finalize release] Finalizing release ${release} [${platform}]`);
  const child = spawn(
    sentryCli,
    ["releases", "finalize", release],
    {
      env: childProcessEnv,
    },
  );

  child.stdout.on("data", data => console.log(`[Finalize release] ${data}`));
  child.stderr.on("data", data => console.error(`\x1B[31m[Finalize release] ${data}\x1B[0m`));

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`sentry-cli exited with code ${code}`));
      }
      resolve();
    });
  });
}

async function createReleaseBundle(platform, versionInfo) {
  const release = createReleaseName(platform, versionInfo);
  console.log(`[Create release bundle] Creating release bundle for release ${release} [${platform}]`);
  const argumentsList = [
    "releases",
    "new",
    release,
  ];

  console.log("[Create release bundle] Creating release bundle with arguments:", `${sentryCli} ${argumentsList.join(" ")}`);

  const child = spawn(sentryCli, argumentsList, {
    cwd: sourceMapDir,
    env: childProcessEnv,
  });

  child.stdout.on("data", data => console.log(`[Create release bundle] ${data}`));
  child.stderr.on("data", data => console.error(`\x1B[31m[Create release bundle] ${data}\x1B[0m`));

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`sentry-cli exited with code ${code}`));
      }
      resolve();
    });
  });
}

function renameSourceMapsAndBundles() {
  return new Promise((resolve, reject) => {
    fs.readdir(sourceMapDir, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const androidSourceMapFile = files.find(file => file.startsWith("android-") && file.endsWith(".map"));
      const iosSourceMapFile = files.find(file => file.startsWith("ios-") && file.endsWith(".map"));

      const androidJsFile = files.find(file => file.startsWith("android-") && file.endsWith(".js"));
      const iosJsFile = files.find(file => file.startsWith("ios-") && file.endsWith(".js"));

      if (androidSourceMapFile) {
        fs.renameSync(path.join(sourceMapDir, androidSourceMapFile), path.join(sourceMapDir, "index.android.bundle.map"));
      }

      if (iosSourceMapFile) {
        fs.renameSync(path.join(sourceMapDir, iosSourceMapFile), path.join(sourceMapDir, "main.jsbundle.map"));
      }

      if (androidJsFile) {
        fs.renameSync(path.join(sourceMapDir, androidJsFile), path.join(sourceMapDir, "index.android.bundle"));
      }

      if (iosJsFile) {
        fs.renameSync(path.join(sourceMapDir, iosJsFile), path.join(sourceMapDir, "main.jsbundle"));
      }

      resolve();
    });
  });
}

async function main() {
  console.log(`Starting publishing process for ${scheme} v${version}...`);
  const { androidUpdateId, iosUpdateId } = await publishUpdates();

  const versionInfo = {
    ...(await getVersionInfo()),
    androidUpdateId,
    iosUpdateId,
    identifier: scheme,
    version,
  };
  await renameSourceMapsAndBundles();

  console.log("Publishing source maps for:", {
    androidUpdateId,
    iosUpdateId,
    ...versionInfo,
  });

  if (androidUpdateId) {
    await createReleaseBundle("android", versionInfo);
    await uploadSourceMaps("android", versionInfo);
    await finalizeRelease("android", versionInfo);
  }
  if (iosUpdateId) {
    await createReleaseBundle("ios", versionInfo);
    await uploadSourceMaps("ios", versionInfo);
    await finalizeRelease("ios", versionInfo);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
