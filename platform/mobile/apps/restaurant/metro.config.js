const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceShared = path.resolve(projectRoot, '../../shared');
const appNodeModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

// Watch the shared folder (outside app root) so Metro picks up changes.
config.watchFolders = [...(config.watchFolders ?? []), workspaceShared];

// Use resolveRequest to handle @okinawa/shared sub-path imports reliably.
// extraNodeModules Proxy does not correctly intercept scoped-package sub-paths
// like @okinawa/shared/config/env because Metro splits the scope (@okinawa)
// from the package name before the lookup, bypassing the keyed entry.
const previousResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@okinawa/shared' || moduleName.startsWith('@okinawa/shared/')) {
    const subPath = moduleName.slice('@okinawa/shared'.length); // '' or '/config/env' etc.
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

// Keep the node_modules fallback for packages that live inside shared/ but
// whose peers must be resolved from the app's own node_modules (e.g. @babel/runtime).
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
