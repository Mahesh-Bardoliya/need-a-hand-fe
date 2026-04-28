import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  return require('react-native-reanimated/mock');
});

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
