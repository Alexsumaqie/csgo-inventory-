const { app, BrowserWindow } = require('electron');
const path = require('path');
const waitOn = require('wait-on');
const { spawn } = require('child_process');
const serverPath = path.join(__dirname, '..', 'server.mjs');

spawn(process.execPath, [serverPath], {
  stdio: 'inherit',
});

const isDev = process.argv.includes('--dev');

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Wait for Vite dev server to be ready
    await waitOn({ resources: ['http://localhost:5173'], timeout: 30000 });
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
