const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  ...(require("node-libs-expo")),
};

config.resolver.sourceExts.push("mjs");

module.exports = config;
