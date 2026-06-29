import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "persnol-uu",
    project: "connplex-ticketing-user"
  })],

  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },

  build: {
    sourcemap: true
  }
})