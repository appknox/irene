import { defineConfig } from 'cypress';
import { configureVisualRegression } from 'cypress-visual-regression/dist/plugin';

export default defineConfig({
  e2e: {
    projectId: 'fkj9f2',
    baseUrl: 'http://localhost:4200/',
    specPattern: ['cypress/tests/**/*.spec.{js,ts}'],

    // Set default viewport to match test requirements
    viewportWidth: 1450,
    viewportHeight: 1650,

    // Screenshot configuration for consistency
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,

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
          // Match window size to viewport + chrome (add ~100px for browser chrome)
          launchOptions.args.push('--window-size=1450,1750');

          // Force device scale factor to 1 for consistent pixel density
          launchOptions.args.push('--force-device-scale-factor=1');

          // Disable GPU hardware acceleration variations
          launchOptions.args.push('--disable-dev-shm-usage');

          // Ensure consistent font rendering
          launchOptions.args.push('--font-render-hinting=none');
          launchOptions.args.push('--disable-font-subpixel-positioning');
        }

        if (browser.family === 'firefox') {
          launchOptions.preferences['layout.css.devPixelsPerPx'] = '1.0';
        }

        return launchOptions;
      });

      configureVisualRegression(on);
    },
  },
});
