/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');

const reanimatedGallery = path.resolve(__dirname, '..');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [reanimatedGallery],
  resolver: {
    extraNodeModules: {
      'react-native': path.resolve(
        __dirname,
        'node_modules/react-native',
      ),
      'react-native-reanimated': path.resolve(
        __dirname,
        'node_modules/react-native',
      ),
      'react-native-gesture-handler': path.resolve(
        __dirname,
        'node_modules/react-native',
      ),
    },
    blacklistRE: blacklist([
      new RegExp(`${reanimatedGallery}/node_modules/react-native/.*`),
      new RegExp(
        `${reanimatedGallery}/node_modules/react-native-reanimated/.*`,
      ),
      new RegExp(
        `${reanimatedGallery}/node_modules/react-native-gesture-handler/.*`,
      ),
    ]),
  },
};
