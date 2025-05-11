const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any additional file extensions here
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

module.exports = config; 