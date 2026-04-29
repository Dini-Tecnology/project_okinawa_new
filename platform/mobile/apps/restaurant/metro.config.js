const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const mobileRoot = path.resolve(__dirname, '../..');

config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@': mobileRoot,
};

config.watchFolders = [...(config.watchFolders || []), mobileRoot];

module.exports = config;
