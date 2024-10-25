import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: { 
        exportType: 'default', 
        ref: true, 
        svgo: false, 
        titleProp: true 
      },
      include: '**/*.svg',
    }),
  ],
  base: './',
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
});