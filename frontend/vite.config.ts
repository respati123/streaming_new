import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        babel: {
          plugins: isProduction
            ? [['react-remove-properties', { properties: ['data-testid'] }]]
            : [],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@core': path.resolve(__dirname, './src/core'),
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    server: {
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:4000',
          ws: true,
        },
      },
    },
  };
});
