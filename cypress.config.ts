import { defineConfig } from 'cypress';
import { configureVisualRegression } from 'cypress-visual-regression/dist/plugin';

export default defineConfig({
  e2e: {
    projectId: 'fkj9f2',
    baseUrl: 'http://localhost:4200/',
    specPattern: ['cypress/tests/**/*.spec.{js,ts}'],
    viewportHeight: 1070,
    viewportWidth: 1480,
    env: {
      hideCredentials: true,
      TEST_USERNAME: '***',
      TEST_PASSWORD: '***',
      visualRegressionType: 'regression',
    },
    screenshotsFolder: './cypress/snapshots/actual',
    setupNodeEvents(on) {
      configureVisualRegression(on);
    },
  },
});
