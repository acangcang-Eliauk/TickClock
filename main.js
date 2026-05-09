const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let isOnTop = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 560,
    height: 420,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setOpacity(1);
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.setVisibleOnAllWorkspaces(true);
}

app.whenReady().then(() => {
  createWindow();

  // Ctrl+Shift+F12 toggles always-on-top and forces window to front
  const registered = globalShortcut.register('Ctrl+Shift+F12', () => {
    if (!mainWindow) return;
    isOnTop = !isOnTop;
    mainWindow.setAlwaysOnTop(isOnTop);
    if (isOnTop) {
      mainWindow.show();
      mainWindow.focus();
    }
    // notify renderer via IPC
    mainWindow.webContents.send('ontop-changed', isOnTop);
  });

  if (!registered) {
    console.error('Global shortcut registration failed');
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('set-always-on-top', (_, val) => {
  if (!mainWindow) return;
  isOnTop = val;
  mainWindow.setAlwaysOnTop(val);
  if (!val) {
    // On Windows: push window to the bottom of the z-order
    // so it stays visible on the desktop behind normal windows.
    // The minimize+restore hint helps windows re-stack it.
    mainWindow.show();
  } else {
    mainWindow.focus();
  }
});

ipcMain.on('set-opacity', (_, val) => {
  if (mainWindow) mainWindow.setOpacity(val);
});

ipcMain.on('window-close', () => {
  app.quit();
});

ipcMain.handle('get-ontop', () => isOnTop);
