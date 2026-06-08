const path = require('path');

function createMetroConfig(appRoot) {
  const mobileRoot = path.resolve(appRoot, '../..');
  const { getDefaultConfig } = require(require.resolve('expo/metro-config', {
    paths: [appRoot],
  }));
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
      '@okinawa/shared': path.resolve(mobileRoot, 'shared'),
    },
  };

  return config;
}

module.exports = { createMetroConfig };
