import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// En desarrollo, Vite sirve la interfaz y reenvía /api al servidor local (puerto 5180).
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:5180' } },
  build: { outDir: 'dist', emptyOutDir: true },
});
