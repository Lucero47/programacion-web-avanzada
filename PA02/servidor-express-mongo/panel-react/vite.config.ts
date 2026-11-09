import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/panel/',
  server: { port: 5174, proxy: { '/api': 'http://localhost:3001' } },
  build: { outDir: '../backend/public/panel', emptyOutDir: true }
});
