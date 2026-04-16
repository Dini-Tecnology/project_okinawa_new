const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceShared = path.resolve(projectRoot, '../../shared');
const appNodeModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), workspaceShared];

const previousResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@okinawa/shared' || moduleName.startsWith('@okinawa/shared/')) {
    const subPath = moduleName.slice('@okinawa/shared'.length);
    const absolutePath = path.join(workspaceShared, subPath);
    return (previousResolveRequest ?? context.resolveRequest)(
      context,
      absolutePath,
      platform
    );
  }
  if (previousResolveRequest) {
    return previousResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get(_target, name) {
      if (typeof name === 'string') {
        return path.join(appNodeModules, name);
      }
      return undefined;
    },
  }
);

module.exports = config;
