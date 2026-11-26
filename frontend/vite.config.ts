/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

// "/" is the static landing page (index.html); every other page route is the React app (app.html).
// Production hosting needs the same rewrite: serve app.html for any path that is not "/" or a file.
const toApp: Connect.NextHandleFunction = (req, _res, next) => {
  const path = (req.url ?? '/').split('?')[0]
  const isPage = req.headers.accept?.includes('text/html') && !path.includes('.') && path !== '/'
  if (isPage) req.url = '/app.html'
  next()
}
const appFallback: Plugin = {
  name: 'app-fallback',
  configureServer: (s) => { s.middlewares.use(toApp) },
  configurePreviewServer: (s) => { s.middlewares.use(toApp) },
}

export default defineConfig({
  plugins: [appFallback, react(), tailwindcss()],
  appType: 'mpa',
  build: {
    // public/assets holds the landing page's design kit, so the app's hashed bundles live apart
    assetsDir: 'bundle',
    rollupOptions: { input: { landing: 'index.html', app: 'app.html' } },
  },
  server: {
    // the Spring Boot backend; avoids CORS during development
    proxy: { '/api': 'http://localhost:8080' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
