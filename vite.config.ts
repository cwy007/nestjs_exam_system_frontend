import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      // 将 /user 代理到后端服务器
      '/user': {
        target: 'http://localhost:3001', // 后端服务器地址
        changeOrigin: true, // 是否修改请求头中的 Origin 字段
      },
      // 将 /exam 代理到后端服务器
      '/exam': {
        target: 'http://localhost:3002', // 后端服务器地址
        changeOrigin: true, // 是否修改请求头中的 Origin 字段
      },
    },
  },
})
