const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @opentelemetry uses dynamic import() which Hermes cannot compile.
// It's pulled in by @supabase/supabase-js but is only telemetry — safe to stub.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@opentelemetry/')) {
    return { type: 'empty' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
