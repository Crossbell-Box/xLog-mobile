const { getDefaultConfig } = require('expo/metro-config');
const extraNodeModules = require('node-libs-browser')

const config = getDefaultConfig(__dirname);

config.resolver['extraNodeModules'] = extraNodeModules

module.exports = config;
