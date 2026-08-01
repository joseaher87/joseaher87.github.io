const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onApplyEffect: (callback) => {
    ipcRenderer.on('apply-effect', (_event, effectId) => callback(effectId));
  },
});
