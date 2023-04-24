import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';

const commitHash = execSync('git rev-parse --short HEAD').toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    APP_BUILD_NUMBER: JSON.stringify(commitHash),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest/setupTests.ts',
  },
});
