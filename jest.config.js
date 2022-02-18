module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "testEnvironment": "jsdom",
  "collectCoverage": true,
  "coverageThreshold": {
    "global": {
      "branches": 85.71,
      "functions": 100,
      "lines": 97,
      "statements": 98
    }
  },
  // We mess with globals (window, document) in the tests so
  // this keeps them from interfering with each other.
  "maxConcurrency": 1
}
