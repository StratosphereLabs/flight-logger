import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';
import eslint from 'vite-plugin-eslint';

const commitHash = execSync('git rev-parse --short HEAD').toString();

const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cesium(), ...(isProduction ? [] : [eslint()])],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    APP_BUILD_NUMBER: JSON.stringify(commitHash),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest/setupTests.ts',
  },
  resolve: {
    alias: {
      '.prisma/client/index-browser':
        './node_modules/.prisma/client/index-browser.js',
    },
  },
});
