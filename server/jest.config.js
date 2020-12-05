module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globalSetup: './src/tests/_setup.ts',
    globalTeardown: './src/tests/_teardown.ts',
};
