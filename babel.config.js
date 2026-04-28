module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      test: {
        plugins: []
      },
      development: {
        plugins: ['react-native-reanimated/plugin']
      },
      production: {
        plugins: ['react-native-reanimated/plugin']
      }
    }
  };
};
