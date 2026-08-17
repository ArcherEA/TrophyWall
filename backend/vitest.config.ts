import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    // disable the Bottleneck throttle during tests so mocked calls run instantly
    env: { STEAM_MIN_TIME_MS: '0' },
    // never run compiled tests emitted into dist
    exclude: [...configDefaults.exclude, 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/generated/**', 'src/**/*.d.ts'],
    },
  },
});
