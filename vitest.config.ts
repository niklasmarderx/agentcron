import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // exFAT volumes create AppleDouble ._* sidecars; never treat them as tests.
    exclude: ['**/node_modules/**', '**/dist/**', '**/._*'],
  },
});
