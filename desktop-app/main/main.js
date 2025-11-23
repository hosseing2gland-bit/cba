import { app, BrowserWindow, session } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultBackend = 'http://localhost:3000';

const resolveBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;

  if (app.isPackaged) {
    const configPath = path.join(process.resourcesPath, 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.backendUrl) return parsed.backendUrl;
      } catch (error) {
        console.warn('Failed to read packaged config', error);
      }
    }
  }

  return defaultBackend;
};

const BACKEND_URL = resolveBackendUrl();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const distPath = path.join(__dirname, '../renderer/dist/index.html');
  if (fs.existsSync(distPath)) {
    win.loadFile(distPath);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  win.removeMenu();
}

app.whenReady().then(async () => {
  await session.defaultSession.setPermissionRequestHandler((_, __, callback) => {
    callback(false);
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' https: http://localhost:3000; frame-ancestors 'none'; font-src 'self';",
        ],
      },
    });
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

export { BACKEND_URL };
