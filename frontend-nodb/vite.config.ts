import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite plugin để phục vụ các Serverless BFF Function (/api/gdrive/*) trong môi trường dev
function vercelBffDevPlugin() {
  return {
    name: 'vercel-bff-dev-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url) return next();
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        if (urlObj.pathname === '/api/gdrive/files' || urlObj.pathname === '/api/gdrive/media') {
          // Tự động load biến môi trường từ .env / .env.local trong dev
          const env = loadEnv(server.config.mode, process.cwd(), '');
          process.env.GDRIVE_API_KEY = process.env.GDRIVE_API_KEY || env.GDRIVE_API_KEY;

          req.query = Object.fromEntries(urlObj.searchParams.entries());

          try {
            const modulePath = urlObj.pathname === '/api/gdrive/files' 
              ? '/api/gdrive/files.ts' 
              : '/api/gdrive/media.ts';
            
            const loadedModule = await server.ssrLoadModule(modulePath);
            return loadedModule.default(req, res);
          } catch (err) {
            console.error(`Lỗi khi thực thi Dev BFF Handler [${urlObj.pathname}]:`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Dev BFF Serverless Proxy Error', details: String(err) }));
          }
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelBffDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
