const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Strip webpack/vite magic comments (e.g. /* webpackIgnore: true */) before
// Hermes sees the bundle. These appear in @supabase/supabase-js → @opentelemetry
// and cause a parse error in Hermes. The transformer also stubs the module below.
config.transformer.babelTransformerPath = require.resolve(
  './strip-magic-comments-transformer'
);

// Stub the @opentelemetry module itself so it resolves to an empty module.
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
