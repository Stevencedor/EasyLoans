import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/EasyLoans/',
  plugins: [react()],
  server: {
    port: 3005,
  },
});