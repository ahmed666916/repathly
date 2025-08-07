const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Metro'ya yol kısayollarını tanıt
config.resolver.alias = {
  '@': path.resolve(__dirname, './app'),
};

module.exports = config;