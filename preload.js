const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePrimaryCities: areas => ipcRenderer.send('save-primary-cities', areas)
});