import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
// GitHub Pages serves this project site under /TrophyWall/, so the production
// build needs that base path; local dev stays at the root for convenience.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/TrophyWall/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
}));
