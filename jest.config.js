module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "collectCoverage": true,
  "coverageThreshold": {
    "global": {
      "branches": 87.41,
      "functions": 100,
      "lines": 98.36,
      "statements": 98.42
    }
  },
  // We mess with globals (window, document) in the tests so
  // this keeps them from interfering with each other.
  "maxConcurrency": 1
}
