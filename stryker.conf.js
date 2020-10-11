module.exports = {
  packageManager: "yarn",
  reporters: ["clear-text", "progress"],
  testRunner: "jest",
  // TODO: https://github.com/stryker-mutator/stryker/issues/2316
  coverageAnalysis: "off",
  // TODO
  // checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  mutate: ["src/**/*.ts", "!src/**/*.test.ts"],
  thresholds: { high: 80, low: 60, break: 30 }
};
