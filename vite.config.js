import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import corsProxyPlugin from './vite/plugins/corsProxy.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), corsProxyPlugin()],
  server: {
    cors: true,
  },
});
