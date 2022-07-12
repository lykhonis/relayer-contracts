require('hardhat/register')

module.exports = {
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/tests/**/*Test.js',
  ],
  logHeapUsage: true,
  testTimeout: 120_000,
  testEnvironment: 'node',
  maxWorkers: '50%',
  maxConcurrency: 10,
  reporters: ['default'],
  verbose: true,
}
