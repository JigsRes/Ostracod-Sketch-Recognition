export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  collectCoverageFrom: [
    "js/**/*.js",
    "!js/require.js",
    "!js/srlib.js",
    "!js/paper-full.js"
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  verbose: true
};
