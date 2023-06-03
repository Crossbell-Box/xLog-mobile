import { spawn } from "child_process";
import { cwd } from "process";

import applyReleasePlan from "@changesets/apply-release-plan";
import { read } from "@changesets/config";
import getReleasePlan from "@changesets/get-release-plan";
import { getPackages } from "@manypkg/get-packages";

async function excuteEASCommands(args: string[], env: object = {}) {
  const command = "eas";

  const child = await spawn(command, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...env,
    },
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Command failed with exit code ${code}`);
      process.exit(code);
    }
  });
}

async function main() {
  const packages = await getPackages(cwd());
  const config = await read(cwd(), packages);
  const releasePlan = await getReleasePlan(cwd());

  console.log(
    JSON.stringify(releasePlan, null, 4),
  );

  const release = releasePlan.releases[0];

  if (release) {
    await applyReleasePlan(
      releasePlan,
      packages,
      config,
    );

    if (release.type === "patch") {
      console.log("Patch release found, publishing hot update.");
      // eas update --branch staging --auto
      await excuteEASCommands([
        "update",
        "--branch",
        "staging",
        "--auto",
      ], {
        NODE_ENV: "staging",
      });
    }
    else if (release.type === "major" || release.type === "minor") {
      console.log("Major or minor release found, publishing new builds.");
      // eas build --non-interactive --profile preview -p all --no-wait
      await excuteEASCommands([
        "build",
        "--non-interactive",
        "--profile",
        "preview",
        "-p",
        "all",
        "--no-wait",
      ], {
        NODE_ENV: "staging",
      });
    }
    return;
  }

  console.log("No release found, skipping preview build.");
  process.exit(0);
}

main();
