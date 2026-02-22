module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10000,
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Only look for tests under src to avoid picking up compiled or d.ts files
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.(ts|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
