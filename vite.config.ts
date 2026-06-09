import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Step 2 Fix: Guarantees absolute path asset routing mapping across deep URL links
  base: '/',
  // Step 1 Fix: Provides a global environment fallback namespace object to prevent runtime environment crashes
  define: {
    'process.env': {},
  },
});