const fs = require("fs");
const path = require("path");

const generateCode = require("@expo/config-plugins/build/utils/generateCode");
const configPlugins = require("expo/config-plugins");

const code = `  pod 'Firebase', :modular_headers => true
  pod 'nanopb', :modular_headers => true
  pod 'FirebaseSessions', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
  pod 'FirebaseInstallations', :modular_headers => true
  pod 'GoogleDataTransport', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  $RNFirebaseAsStaticFramework = true`;

const withReactNativeFirebase = (config) => {
  return configPlugins.withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      const contents = fs.readFileSync(filePath, "utf-8");

      const addCode = generateCode.mergeContents({
        tag: "withReactNativeFirebase",
        src: contents,
        newSrc: code,
        anchor: /\s*get_default_flags\(\)/i,
        offset: 2,
        comment: "#",
      });

      if (!addCode.didMerge) {
        console.error(
          "ERROR: Cannot add withReactNativeFirebase to the project's ios/Podfile because it's malformed.",
        );
        return config;
      }

      fs.writeFileSync(filePath, addCode.contents);

      return config;
    },
  ]);
};

module.exports = withReactNativeFirebase;
