import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      minify: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
  preload: {
    build: {
      outDir: 'out/preload',
      minify: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    build: {
      outDir: 'out/renderer',
      minify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Don't split vendor chunks unnecessarily
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
      },
    },
    plugins: [react()],
  },
});
