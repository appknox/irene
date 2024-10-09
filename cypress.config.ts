import { defineConfig } from 'cypress';
import { configureVisualRegression } from 'cypress-visual-regression/dist/plugin';

export default defineConfig({
  e2e: {
    projectId: 'fkj9f2',
    baseUrl: 'http://localhost:4200/',
    specPattern: ['cypress/tests/**/*.spec.{js,ts}'],
    env: {
      TEST_USERNAME: '***',
      TEST_PASSWORD: '***',
      DYNAMIC_SCAN_SYSTEM_APK_FILE_ID: '***',
      DYNAMIC_SCAN_SYSTEM_IPA_FILE_ID: '***',
      visualRegressionType: 'regression',
    },
    screenshotsFolder: './cypress/snapshots/actual',
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--window-size=1350,1024');
          launchOptions.args.push('--force-device-scale-factor=1');
        }

        return launchOptions;
      });

      configureVisualRegression(on);
    },
  },
});
