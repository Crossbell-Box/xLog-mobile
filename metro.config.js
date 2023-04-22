const { getDefaultConfig } = require("@expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    ...(require("node-libs-expo")),
  };
  return config;
})();
