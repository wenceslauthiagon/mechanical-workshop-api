module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '<rootDir>/test/**/*.spec.ts',
    '<rootDir>/test/**/*.test.ts'
  ],
  transform: {
    '^.+\\.(t|js)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js/faker)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.(t|js)',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testTimeout: 30000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json',
    },
  },
};