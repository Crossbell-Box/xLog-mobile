process.env.TAMAGUI_TARGET = "native"; 

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
            alias: {
              "@/components": "./src/components",
              "@/pages": "./src/pages",
              "@/constants": "./src/constants",
              "@/styles": "./src/styles",
            }
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
