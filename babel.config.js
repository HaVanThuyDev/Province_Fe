module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.ios.js',
            '.android.js',
            '.web.js',
            '.js',
            '.ts',
            '.tsx',
            '.json',
          ],
          alias: {
            '@components': './src/components',
            '@features': './src/features',
            '@constants': './src/constants',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@assets': './src/assets',
          },
        },
      ],
    ],
  };
};