process.env.TAMAGUI_TARGET = "native";

const fs = require("fs");
const path = require("path");
const srcDir = path.resolve(__dirname, "src");
const dirs = fs.readdirSync(srcDir).filter(file => fs.statSync(path.join(srcDir, file)).isDirectory());
const { resolve } = require("path");

const isProd = process.env.NODE_ENV === "production";

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: [
            "./src",
            "./modules",
          ],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: dirs.reduce((acc, dir) => {
            acc[`@/${dir}`] = `./src/${dir}`;
            return acc;
          }, {
            "crossbell/network": path.resolve(__dirname, "node_modules/crossbell/dist/network.js"),
            "crossbell/ipfs": path.resolve(__dirname, "node_modules/crossbell/dist/ipfs.js"),
            ...(isProd ? {} : { "@react-native-firebase/analytics": resolve(__dirname, "./mocks/analytics.js") }),
          }),
        },
      ],
      // Using ethers 6.1 required private class properties and it broke FlatList
      // https://github.com/facebook/react-native/issues/29084#issuecomment-1463493342
      "@babel/plugin-transform-flow-strip-types",
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      ["@babel/plugin-proposal-private-methods", { loose: true }],
      ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
      "@babel/plugin-proposal-export-namespace-from",
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true,
        },
      ],
      [
        "transform-inline-environment-variables",
        {
          include: "TAMAGUI_TARGET",
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
