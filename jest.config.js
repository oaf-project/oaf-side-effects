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
      "branches": 88,
      "functions": 100,
      "lines": 97,
      "statements": 97
    }
  }
}
