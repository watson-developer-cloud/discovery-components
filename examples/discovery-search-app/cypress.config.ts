import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 30000,
  video: false,
  retries: {
    runMode: 2,
    openMode: 0
  },
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000/'
  }
});
