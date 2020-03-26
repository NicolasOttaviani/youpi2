const svelteConfig = require('./svelte.config')
module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.svelte$': ['jest-transform-svelte', { ...svelteConfig }],
  },
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  testPathIgnorePatterns: ['node_modules'],
  bail: false,
  verbose: true,
  transformIgnorePatterns: ['node_modules'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.ts',
    '<rootDir>/src/**/?(*.)(spec|test).ts',
  ],
  testEnvironment: 'jsdom',
}
