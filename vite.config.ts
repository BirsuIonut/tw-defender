import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the project site under /<repo>/, so assets must be
// loaded from that prefix. Override with VITE_BASE if you point a custom
// domain at the repo or move it elsewhere.
const base = process.env.VITE_BASE ?? '/tw-defender/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
