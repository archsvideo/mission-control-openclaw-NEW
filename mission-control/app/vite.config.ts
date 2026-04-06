import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const workspaceRoot = path.resolve(__dirname, '..', '..');
const reportsRoot = path.join(workspaceRoot, 'reports');

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.md') return 'text/markdown; charset=utf-8';
  if (ext === '.txt') return 'text/plain; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

function serveWorkspaceReports(): Plugin {
  const handler = (req: any, res: any, next: () => void) => {
    const url = req.url?.split('?')[0] ?? '';
    if (!url.startsWith('/reports/')) return next();

    const relativePath = decodeURIComponent(url.replace(/^\/reports\//, ''));
    const filePath = path.resolve(reportsRoot, relativePath);
    if (!filePath.startsWith(reportsRoot)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return next();
    }

    res.setHeader('Content-Type', contentTypeFor(filePath));
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(filePath).pipe(res);
  };

  return {
    name: 'serve-workspace-reports',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [react(), serveWorkspaceReports()],
  server: {
    host: '0.0.0.0',
    port: 4173,
    fs: {
      allow: [workspaceRoot],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
