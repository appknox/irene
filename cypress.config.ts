import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    projectId: 'fkj9f2',
    baseUrl: 'http://localhost:4200/',
    specPattern: ['cypress/e2e/**/*.spec.{js,ts}'],
    viewportHeight: 1070,
    viewportWidth: 1480,
    env: {
      hideCredentials: true,
      TEST_USERNAME: '***',
      TEST_PASSWORD: '***',
    },
    setupNodeEvents(on, config) {},
  },
});
