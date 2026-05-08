import { defineConfig } from 'vite';

export default defineConfig({
  base: '/A-LENDA-DE-ADLEZ/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
  },
});
