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
});
