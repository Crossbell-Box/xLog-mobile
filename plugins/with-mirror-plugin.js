const fs = require("fs");
const path = require("path");

const { withDangerousMod } = require("@expo/config-plugins");

function withNewPodfile(config) {
  return withDangerousMod(config, [
    "ios",
    async (c) => {
      const filePath = path.join(c.modRequest.platformProjectRoot, "Podfile");
      const contents = fs.readFileSync(filePath, "utf-8");

      fs.writeFileSync(filePath, `source 'https://github.com/CocoaPods/Specs.git'\n${contents}`);

      return c;
    },
  ]);
}

module.exports = (config) => {
  return withNewPodfile(config);
};
