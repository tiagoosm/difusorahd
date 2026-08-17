import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Sem isso, o chunking automático do Rollup agrupa o recharts (usado
        // só pelos gráficos do admin) com módulos triviais compartilhados
        // entre Dashboard e Analytics — o chunk final acaba com o nome de um
        // componente pequeno qualquer (ex: "DashboardCard-*.js" pesando
        // 300+ kB), escondendo de onde o peso realmente vem. Isolar recharts
        // num chunk próprio também ajuda o cache do navegador entre deploys,
        // já que essa dependência muda bem menos que o código da aplicação.
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
