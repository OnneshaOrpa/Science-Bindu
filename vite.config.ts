
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000
  },
  define: {
    // Bridges the gap between Node.js environment variables and client-side code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
