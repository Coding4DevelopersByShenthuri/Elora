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
        // Manual chunk splitting for better caching and smaller initial bundle
        manualChunks: (id) => {
          // Vendor libraries - split into logical groups
          if (id.includes('node_modules')) {
            // React core - most frequently used
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            
            // UI libraries
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            
            // Chart library
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            
            // Heavy ML/AI libraries - keep separate and lazy load
            if (id.includes('@xenova/transformers')) {
              return 'transformers-vendor';
            }
            if (id.includes('onnxruntime-web')) {
              return 'onnxruntime-vendor';
            }
            
            // Other large dependencies
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
              return 'data-vendor';
            }
            
            // Remaining node_modules - split into smaller chunks
            const remainingModules = id.split('node_modules/')[1];
            if (remainingModules) {
              const packageName = remainingModules.split('/')[0];
              // Group small packages together
              if (['clsx', 'class-variance-authority', 'tailwind-merge'].includes(packageName)) {
                return 'utils-vendor';
              }
              // Keep other packages in a common vendor chunk
              return 'vendor';
            }
          }
          
          // Split large source files by route/page
          if (id.includes('src/pages/')) {
            const pageMatch = id.match(/src\/pages\/([^/]+)/);
            if (pageMatch) {
              const pageName = pageMatch[1];
              // Keep large pages separate
              if (['adults', 'TeenKids', 'YoungKids'].includes(pageName)) {
                return `page-${pageName}`;
              }
            }
          }
          
          // Split large components
          if (id.includes('src/components/adults/')) {
            const componentMatch = id.match(/src\/components\/adults\/([^/]+)/);
            if (componentMatch) {
              const componentName = componentMatch[1];
              // Keep large components separate
              if (['DictionaryWidget', 'MultiModePracticeHub', 'PronunciationAnalyzer'].includes(componentName)) {
                return `component-${componentName}`;
              }
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
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      // External WASM files to prevent bundling issues
      external: [],
    },
    // Enable source maps for debugging (can be disabled in production)
    sourcemap: false,
    // Increase chunk size warning limit (but still warn for very large chunks)
    chunkSizeWarningLimit: 1500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for better performance
    target: 'esnext',
    // Use esbuild for faster minification (now installed as dev dependency)
    minify: 'esbuild',
    // Copy WASM files for ONNX Runtime - ensure they're not inlined
    assetsInlineLimit: 0,
    // Report compressed size
    reportCompressedSize: true,
  },
  // PWA and offline support
  publicDir: 'public',
})
