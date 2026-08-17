import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    // disable the Bottleneck throttle during tests so mocked calls run instantly
    env: { STEAM_MIN_TIME_MS: '0' },
    // never run compiled tests emitted into dist
    exclude: [...configDefaults.exclude, 'dist/**'],
  },
});
