// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wagmi: ['wagmi', 'viem'],
          ethers: ['ethers'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          ui2: ['@radix-ui/react-switch', '@radix-ui/react-toast', '@radix-ui/react-dropdown-menu'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'wagmi', 'viem', 'ethers'],
    exclude: ['@radix-ui/react-dropdown-menu'],
  },
  server: {
    port: 3000,
    host: true,
  },
})
