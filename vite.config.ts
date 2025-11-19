// FIX: Add a triple-slash directive to include Node.js type definitions.
// This resolves the TypeScript error for `process.cwd()` by ensuring the
// correct types for the `process` global are available in this file.
/// <reference types="node" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
