import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
const mode = process.env.NODE_ENV || 'development';

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    visualizer({ open: true, filename: 'bundle-visualization.html' }),
    compression(),
  ],
  build: {
    sourcemap: true, // Enable source maps for debugging
    target: 'esnext',
    // minify: 'terser',
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        dead_code: true,
      },
    },
    chunkSizeWarningLimit: 500, // Keep chunks under 500kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // if (id.includes('react')) return 'vendor-react';
            if (id.includes('quill')) return 'vendor-quill';
            if (id.includes('lodash')) return 'vendor-lodash';
            if (id.includes('date-fns')) return 'vendor-date-fns';
            if (id.includes('@reduxjs/toolkit')) return 'vendor-redux';
            return 'vendor'; // Other vendor libraries
          }
        },
      },
    },
  },
});
