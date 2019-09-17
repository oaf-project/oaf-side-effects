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
      "branches": 86.15,
      "functions": 100,
      "lines": 98,
      "statements": 98
    }
  },
  // We mess with globals (window, document) in the tests so
  // this keeps them from interfering with each other.
  "maxConcurrency": 1
}
