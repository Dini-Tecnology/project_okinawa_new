const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

function createMetroConfig(appRoot) {
  const mobileRoot = path.resolve(appRoot, '../..');
  const config = getDefaultConfig(appRoot);

  config.watchFolders = [...(config.watchFolders || []), mobileRoot];
  config.resolver = {
    ...config.resolver,
    nodeModulesPaths: [
      path.resolve(appRoot, 'node_modules'),
      path.resolve(mobileRoot, 'node_modules'),
    ],
    disableHierarchicalLookup: true,
    extraNodeModules: {
      ...(config.resolver?.extraNodeModules || {}),
      '@': mobileRoot,
    },
  };

  return config;
}

module.exports = { createMetroConfig };
