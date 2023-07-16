const fs = require("fs");
const path = require("path");

const { getConfig } = require("@expo/config");
const spawnAsync = require("@expo/spawn-async");
const chalk = require("chalk");

const easConfig = require("../eas.json");

require("./set-app-config-env.js")();

const appDir = process.cwd();

console.log();
console.log(chalk.green("Sentry source maps script. Working directory:"));
console.log(appDir);

console.log();

console.log(chalk.green("Importing Expo Config..."));
const config = getConfig(appDir, { skipSDKVersionRequirement: true });
if (!config) {
  throw new Error(
    "Failed to import Expo config. Are you in your app directory?",
  );
}
console.log("Expo Config imported for", chalk.blue(config.exp.name));

const skipUpdate = "SKIP_EAS_UPDATE" in process.env;

function parseUpdateInfo(infoString = "") {
  const iosPrefix = "iOS update ID";
  const androidPrefix = "Android update ID";

  if (
    !infoString.includes(androidPrefix)
    && !infoString.includes(iosPrefix)
  ) {
    return {};
  }

  const lines = infoString.split("\n");
  const androidLine = lines.find(line => line.includes(androidPrefix));
  const iosLine = lines.find(line => line.includes(iosPrefix));

  const androidUpdateId = androidLine ? androidLine.split(androidPrefix)[1].trim() : undefined;
  const iosUpdateId = iosLine ? iosLine.split(iosPrefix)[1].trim() : undefined;

  return {
    androidUpdateId,
    iosUpdateId,
  };
}

const run = async () => {
  const [command, ..._args] = process.argv.slice(2);

  const args = [..._args];

  const versionCommand = "eas";

  const profile = Object.values(easConfig.build).find(build => build.env.STAGE === process.env.STAGE).channel;

  const versionArgs = ["build:version:get", "-p", "all", "-e", profile];

  const getRemoteVersions = async () => {
    try {
      const getRemoteVersionsCmd = spawnAsync(versionCommand, versionArgs, {
        stdio: ["inherit", "pipe", "pipe"],
        env: process.env,
        cwd: process.cwd(),
      });
      const {
        child: { stdout, stderr },
      } = getRemoteVersionsCmd;

      if (!(stdout && stderr)) {
        throw new Error("Failed to spawn eas-cli");
      }
      let output = [];
      console.log();
      console.log(
        chalk.green("[eas-update-sentry] Running the following command:"),
      );
      console.log(versionCommand, versionArgs.join(" "));
      console.log();

      stdout.on("data", (data) => {
        const stringData = data.toString("utf8");
        console.log(chalk.green("[eas-update-sentry]"), stringData);
        output = [
          ...output,
          stringData
            .split("\n")
            .map(s => s.trim())
            .at(0),
        ];
      });
      await getRemoteVersionsCmd;

      const versions = output.reduce((acc, curr) => {
        const values = curr.split(" - ");
        if (values[0] === "Android versionCode") {
          acc.android = values[1];
        }
        if (values[0] === "iOS buildNumber") {
          acc.ios = values[1];
        }
        return acc;
      }, {});

      return versions;
    }
    catch (err) {
      throw new Error("Failed to fetch remote versions");
    }
  };

  try {
    const updateProcess = spawnAsync(command, args, {
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
      cwd: process.cwd(),
    });
    const {
      child: { stdout, stderr },
    } = updateProcess;

    if (!(stdout && stderr)) {
      throw new Error("Failed to spawn eas-cli");
    }

    let output = [];
    console.log();
    console.log(
      chalk.green("[eas-update-sentry] Running the following command:"),
    );
    console.log(command, args.join(" "));
    console.log();

    let iosUpdateId;
    let androidUpdateId;

    stdout.on("data", (data) => {
      const stringData = data.toString("utf8");

      const { iosUpdateId: _iosUpdateId, androidUpdateId: _androidUpdateId } = parseUpdateInfo(stringData);

      if (_iosUpdateId) {
        iosUpdateId = _iosUpdateId;
        console.log(chalk.green("[eas-update-sentry] iOS update ID found: ", iosUpdateId));
      }

      if (_androidUpdateId) {
        androidUpdateId = _androidUpdateId;
        console.log(chalk.green(`[eas-update-sentry] Android update ID found: ${androidUpdateId}`));
      }

      console.log(chalk.green("[eas-update-sentry]"), stringData);
      output = stringData.split("\n").map(s => s.trim());
    });

    await updateProcess;

    const getBundles = () => {
      const bundles = fs.readdirSync(path.resolve(appDir, "dist/bundles"));

      const iosBundle = bundles.find(
        s => s.startsWith("ios-") && s.endsWith(".js"),
      );
      const iosMap = bundles.find(
        s => s.startsWith("ios-") && s.endsWith(".map"),
      );

      const androidBundle = bundles.find(
        s => s.startsWith("android-") && s.endsWith(".js"),
      );
      const androidMap = bundles.find(
        s => s.startsWith("android-") && s.endsWith(".map"),
      );

      return { iosBundle, iosMap, androidBundle, androidMap };
    };

    const { iosBundle, iosMap, androidBundle, androidMap } = getBundles();

    const uploadSourceMap = async ({
      updateId,
      buildNumber,
      bundleIdentifier,
      platform,
    }) => {
      const sentryConfig = config.exp.hooks?.postPublish?.find(h =>
        h.file?.includes("upload-sourcemaps"),
      )?.config;

      const version = config.exp.version || config.exp.runtimeVersion;

      const sentryCliPath = "node_modules/@sentry/cli/bin/sentry-cli";
      const args = [
        "releases",
        "files",
        `${bundleIdentifier}@${version}+${buildNumber}`,
        "upload-sourcemaps",
        "--dist",
        updateId,
        "--rewrite",
        platform === "ios"
          ? "dist/bundles/main.jsbundle"
          : "dist/bundles/index.android.bundle",
        platform === "ios"
          ? `dist/bundles/${iosMap}`
          : `dist/bundles/${androidMap}`,
      ];

      console.log(
        chalk.green("[eas-update-sentry] Running the following command:"),
      );
      console.log(sentryCliPath, args.join(" "));

      const result = spawnAsync(sentryCliPath, args, {
        env: {
          ...process.env,
          SENTRY_ORG: sentryConfig?.organization || process.env.SENTRY_ORG,
          SENTRY_PROJECT: sentryConfig?.project || process.env.SENTRY_PROJECT,
          SENTRY_AUTH_TOKEN:
              sentryConfig?.authToken || process.env.SENTRY_AUTH_TOKEN,
          SENTRY_URL:
              sentryConfig?.url
              || process.env.SENTRY_URL
              || "https://sentry.io/",
        },
      });

      result.child.stdout?.on("data", (data) => {
        console.log(
          chalk.green("[eas-update-sentry]"),
          data
            .toString("utf8")
            .split("\n")
            .map(l => `[Upload ${platform} sourcemaps] ${l}`)
            .join("\n"),
        );
      });

      await result;
    };

    const uploadIosSourceMap = async (buildNumber) => {
      console.log(`[eas-update-sentry] iOS: ${JSON.stringify({ iosUpdateId, iosBundle, iosMap }, null, 4)}`);

      if (iosUpdateId && iosBundle && iosMap) {
        console.log();
        console.log(
          chalk.green("[eas-update-sentry] Updating iOS Bundle File...\n"),
          console.log("[update-id]", iosUpdateId),
        );

        fs.renameSync(
          `dist/bundles/${iosBundle}`,
          "dist/bundles/main.jsbundle",
        );
        const iOSConfig = {
          bundleIdentifier: config.exp.ios?.bundleIdentifier,
        };
        if (Object.values(iOSConfig).every(Boolean)) {
          await uploadSourceMap({
            updateId: iosUpdateId,
            buildNumber,
            bundleIdentifier: iOSConfig.bundleIdentifier,
            platform: "ios",
          });
        }
        else {
          console.log(
            chalk.yellow(
              "[eas-update-sentry] Skipping iOS, missing the following values from your app.config file:",
              Object.entries(iOSConfig)
                .filter(([key, value]) => !value)
                .map(([key]) => key)
                .join(" "),
            ),
          );
        }
      }
      else {
        console.log(
          chalk.yellow(
            "[eas-update-sentry] Skipping iOS, missing the following values:",
            Object.entries({ iosUpdateId, iosBundle, iosMap })
              .filter(([key, value]) => !value)
              .map(([key]) => key)
              .join(" "),
          ),
        );
      }
    };

    const uploadAndroidSourceMap = async (buildNumber) => {
      console.log(`[eas-update-sentry] Android: ${JSON.stringify({ iosUpdateId, iosBundle, iosMap }, null, 4)}`);

      if (androidUpdateId && androidBundle && androidMap) {
        console.log();
        console.log(
          chalk.green("[eas-update-sentry] Updating Android Bundle File..."),
        );

        fs.renameSync(
          `dist/bundles/${androidBundle}`,
          "dist/bundles/index.android.bundle",
        );
        const androidConfig = {
          package: config.exp.android?.package,
        };
        if (Object.values(androidConfig).every(Boolean)) {
          await uploadSourceMap({
            updateId: androidUpdateId,
            buildNumber,
            bundleIdentifier: androidConfig.package,
            platform: "android",
          });
        }
        else {
          console.log(
            chalk.yellow(
              "[eas-update-sentry] Skipping Android, missing the following values from your app.config file:",
              Object.entries(androidConfig)
                .filter(([key, value]) => !value)
                .map(([key]) => key)
                .join(" "),
            ),
          );
        }
      }
      else {
        console.log(
          chalk.yellow(
            "[eas-update-sentry] Skipping Android, missing the following values:",
            Object.entries({ androidUpdateId, androidBundle, androidMap })
              .filter(([key, value]) => !value)
              .map(([key]) => key)
              .join(" "),
          ),
        );
      }
    };

    const buildNumber = await getRemoteVersions();

    await Promise.all([
      uploadIosSourceMap(buildNumber.ios),
      uploadAndroidSourceMap(buildNumber.android),
    ]);
  }
  catch (error) {
    process.exit();
  }
};

run().then((r) => {
  console.log(chalk.yellow("Done!"));
});
