process.env.TAMAGUI_TARGET = "native"; 

const fs = require("fs");
const path = require("path");
const srcDir = path.resolve(__dirname, "src");
const dirs = fs.readdirSync(srcDir).filter((file) => fs.statSync(path.join(srcDir, file)).isDirectory());

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
          'module-resolver',
          {
            root: ['./src'],
            extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
            alias: dirs.reduce((acc, dir) => {
              acc[`@/${dir}`] = `./src/${dir}`;
              return acc;
            }, {})
          }
      ],
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
