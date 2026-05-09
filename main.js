const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let isOnTop = true;
let tray;
let isQuitting = false;

const statePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWinState() {
  try {
    if (fs.existsSync(statePath)) return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (_) {}
  return {};
}

function saveWinState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const b = mainWindow.getBounds();
    fs.writeFileSync(statePath, JSON.stringify({ x: b.x, y: b.y }));
  } catch (_) {}
}

function buildTrayMenu() {
  const autoStart = app.getLoginItemSettings().openAtLogin;
  return Menu.buildFromTemplate([
    {
      label: '显示/隐藏', click: () => {
        if (mainWindow.isVisible()) { mainWindow.hide(); }
        else { mainWindow.show(); mainWindow.focus(); }
      }
    },
    {
      label: '设置', click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('show-settings');
      }
    },
    { type: 'separator' },
    {
      label: '总在最前', type: 'checkbox', checked: isOnTop,
      click: (mi) => {
        isOnTop = mi.checked;
        mainWindow.setAlwaysOnTop(isOnTop);
        mainWindow.webContents.send('ontop-changed', isOnTop);
      }
    },
    {
      label: '开机自启', type: 'checkbox', checked: autoStart,
      click: (mi) => {
        app.setLoginItemSettings({ openAtLogin: mi.checked });
        mainWindow.webContents.send('autostart-changed', mi.checked);
      }
    },
    { type: 'separator' },
    {
      label: '退出', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
  tray = new Tray(icon);
  tray.setToolTip('TickClock');
  tray.setContextMenu(buildTrayMenu());
  tray.on('double-click', () => {
    if (mainWindow.isVisible()) { mainWindow.hide(); }
    else { mainWindow.show(); mainWindow.focus(); }
  });
}

function createWindow() {
  const ws = loadWinState();
  mainWindow = new BrowserWindow({
    x: ws.x, y: ws.y,
    width: 560, height: 420,
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

  mainWindow.on('move', saveWinState);
  mainWindow.on('resize', saveWinState);

  mainWindow.on('close', (e) => {
    if (!isQuitting) { e.preventDefault(); mainWindow.hide(); }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  const registered = globalShortcut.register('Ctrl+Shift+F12', () => {
    if (!mainWindow) return;
    isOnTop = !isOnTop;
    mainWindow.setAlwaysOnTop(isOnTop);
    if (isOnTop) { mainWindow.show(); mainWindow.focus(); }
    mainWindow.webContents.send('ontop-changed', isOnTop);
    tray.setContextMenu(buildTrayMenu());
  });

  if (!registered) console.error('Global shortcut registration failed');
});

app.on('will-quit', () => { globalShortcut.unregisterAll(); });
app.on('window-all-closed', () => { app.quit(); });

// IPC handlers
ipcMain.on('set-always-on-top', (_, val) => {
  if (!mainWindow) return;
  isOnTop = val;
  mainWindow.setAlwaysOnTop(val);
  if (!val) mainWindow.show();
  else mainWindow.focus();
  tray.setContextMenu(buildTrayMenu());
});

ipcMain.on('set-opacity', (_, val) => {
  if (mainWindow) mainWindow.setOpacity(val);
});

ipcMain.on('window-close', () => {
  mainWindow.hide();
});

ipcMain.handle('get-ontop', () => isOnTop);

ipcMain.on('set-autostart', (_, val) => {
  app.setLoginItemSettings({ openAtLogin: val });
});

ipcMain.handle('get-autostart', () => {
  return app.getLoginItemSettings().openAtLogin;
});
