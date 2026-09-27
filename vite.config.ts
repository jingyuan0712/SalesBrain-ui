import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署設定：需與 repo 名稱一致
  base: '/SalesBrain-ui/',
})
