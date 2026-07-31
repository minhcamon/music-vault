import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Expose trên tất cả interface (0.0.0.0) → thiết bị LAN có thể truy cập
    open: true
  }
})
