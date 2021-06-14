/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // automock: false,
  // bail: 0,
  // browser: false,
  // cacheDirectory: "",
  clearMocks: false,
  // collectCoverage: false,
  // collectCoverageFrom: undefined,
  coverageDirectory: 'coverage',
  // coveragePathIgnorePatterns: [
  //   "\\\\node_modules\\\\"
  // ],
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],
  // coverageThreshold: undefined,
  // dependencyExtractor: undefined,
  // errorOnDeprecated: false,
  // forceCoverageMatch: [],
  // globalSetup: undefined,
  // globalTeardown: undefined,
  // globals: {},
  // maxWorkers: "50%",
  // moduleDirectories: [
  //   "node_modules"
  // ],
  // moduleFileExtensions: [
  //   "js",
  //   "json",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "node"
  // ],
  // moduleNameMapper: {},
  modulePathIgnorePatterns: ['/helpers/'],
  // notify: false,
  // notifyMode: "failure-change",
  // preset: undefined,
  // projects: undefined,
  // reporters: undefined,
  // resetMocks: false,
  // resetModules: false,
  // resolver: undefined,
  // restoreMocks: false,
  // rootDir: undefined,
  // roots: [
  //   "<rootDir>"
  // ],
  // runner: "jest-runner",
  // setupFiles: [],
  // setupFilesAfterEnv: [],
  // snapshotSerializers: [],
  testEnvironment: 'node',
  // testEnvironmentOptions: {},
  // testLocationInResults: false,
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],
  // testPathIgnorePatterns: [
  //   "\\\\node_modules\\\\"
  // ],
  // testRegex: [],
  // testResultsProcessor: undefined,
  // testRunner: "jasmine2",
  // testURL: "http://localhost",
  // timers: "real",
  // transform: undefined,
  transformIgnorePatterns: [],
  // unmockedModulePathPatterns: undefined,
  // verbose: undefined,
  // watchPathIgnorePatterns: [],
  // watchman: true,
}
