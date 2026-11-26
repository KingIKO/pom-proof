import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /<repo>/. Override with BASE_PATH for other hosts.
const base = process.env.BASE_PATH ?? '/pom-proof/';

export default defineConfig({
  base,
  plugins: [react()],
  worker: { format: 'es' },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
