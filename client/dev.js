import { fileURLToPath } from 'url';
import path from 'path';
import { createServer } from 'vite';

const clientDir = path.dirname(fileURLToPath(import.meta.url));

try {
  const server = await createServer({
    root: clientDir,
    configFile: path.join(clientDir, 'vite.config.js'),
    clearScreen: false,
    server: {
      port: 5173,
      host: true,
    },
  });
  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({ print: true });
} catch (err) {
  console.error('Failed to start Vite dev server:', err);
  process.exit(1);
}
