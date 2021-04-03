module.exports = {
  // preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './dist/tests/_setup.js',
  globalTeardown: './dist/tests/_teardown.js',
  moduleNameMapper: {
    '^#entities$': '<rootDir>/dist/entities/index.js',
  },
};
