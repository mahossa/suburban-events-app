/**
 * Custom Metro babel transformer that strips webpack/vite magic comments
 * from dynamic import() calls before Hermes processes them.
 *
 * Hermes rejects:  import(/* webpackIgnore: true *\/ OTEL_PKG)
 * This produces:   import(OTEL_PKG)
 *
 * The @opentelemetry module itself is stubbed in metro.config.js resolveRequest,
 * so this is safe — we just need to remove the comment that breaks the parser.
 */

// Use the upstream transformer that expo/metro-config already configured.
// It lives here for Expo SDK 52+; fall back to the metro default if needed.
let upstream;
try {
  upstream = require('expo/node_modules/@expo/metro-config/build/babel-transformer');
} catch {
  upstream = require('@react-native/metro-babel-transformer');
}

module.exports.transform = async function stripAndTransform(params) {
  const src = params.src.replace(/\/\*\s*(?:webpack\w*|@vite-ignore)[^*]*\*\//g, '');
  return upstream.transform({ ...params, src });
};
