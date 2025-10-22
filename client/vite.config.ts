import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'recharts',
      'tslib'
    ],
    exclude: [
      '@xenova/transformers',
      'onnxruntime-web'
    ],
    // Force dependency re-optimization on config change
    force: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Optimize for offline usage
    manifest: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            // Keep transformers and onnxruntime separate to avoid bundling issues
            if (id.includes('@xenova/transformers')) {
              return 'transformers-vendor';
            }
            if (id.includes('onnxruntime-web')) {
              return 'onnxruntime-vendor';
            }
          }
        },
        // Ensure WASM files are in the correct location
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return '[name][extname]'; // Keep WASM files in root
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      // External WASM files to prevent bundling issues
      external: [],
    },
    // Enable source maps for debugging (can be disabled in production)
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for better performance
    target: 'esnext',
    // Minification
    minify: 'terser',
    // Copy WASM files for ONNX Runtime - ensure they're not inlined
    assetsInlineLimit: 0,
  },
  // PWA and offline support
  publicDir: 'public',
})
