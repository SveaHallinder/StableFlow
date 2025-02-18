const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/dist/metro');
const path = require('path');

const config = (() => {
const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
    ...defaultConfig,
    transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
    ...defaultConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg').concat(['fx']),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg', 'css', 'nativewind'],
    },
};

return withNativeWind(customConfig, { input: './global.css' });
})();

module.exports = config;
