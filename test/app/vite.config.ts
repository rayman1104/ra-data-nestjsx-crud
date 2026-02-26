import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'ra-data-nestjsx-crud': path.resolve(__dirname, '../../packages/data-provider/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
