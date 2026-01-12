module.exports = {
  useBabelInstrumenter: true,
  reporters: ['lcov', 'json-summary', 'text-summary'],
  coverageFolder: 'coverage',
  excludes: ['**/mirage/**/*', '**/tests/**/*', '**/config/**/*'],
};
