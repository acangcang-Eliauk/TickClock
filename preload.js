const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tickAPI', {
  setAlwaysOnTop: (val) => ipcRenderer.send('set-always-on-top', val),
  setOpacity: (val) => ipcRenderer.send('set-opacity', val),
  close: () => ipcRenderer.send('window-close'),
  getOntop: () => ipcRenderer.invoke('get-ontop'),
  onOntopChanged: (callback) => {
    const listener = (_, val) => callback(val);
    ipcRenderer.on('ontop-changed', listener);
    return () => ipcRenderer.removeListener('ontop-changed', listener);
  },
  setAutoStart: (val) => ipcRenderer.send('set-autostart', val),
  getAutoStart: () => ipcRenderer.invoke('get-autostart'),
  onAutoStartChanged: (callback) => {
    const listener = (_, val) => callback(val);
    ipcRenderer.on('autostart-changed', listener);
    return () => ipcRenderer.removeListener('autostart-changed', listener);
  },
  onShowSettings: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('show-settings', listener);
    return () => ipcRenderer.removeListener('show-settings', listener);
  },
});
