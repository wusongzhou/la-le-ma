const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 添加 WASM 文件支持
config.resolver.assetExts.push('wasm');

// 配置 WASM 文件的处理
config.resolver.sourceExts = [...config.resolver.sourceExts, 'sql'];

module.exports = config;
