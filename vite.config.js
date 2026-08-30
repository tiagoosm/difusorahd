import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Without this, Rollup's automatic chunking groups recharts (used
        // only by the admin's charts) with trivial modules shared between
        // Dashboard and Analytics — the final chunk ends up named after
        // some small component (e.g. "DashboardCard-*.js" weighing
        // 300+ kB), hiding where the weight actually comes from. Isolating
        // recharts into its own chunk also helps the browser's cache
        // across deploys, since this dependency changes a lot less often
        // than the application code.
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts-vendor'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
})
