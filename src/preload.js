// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('HomeFunctions', {
  getModels: () => ipcRenderer.invoke('get-models'),
  importModel: () => ipcRenderer.invoke('import-model'),
  readModel: (modelName) => ipcRenderer.invoke('read-model', modelName),
  saveTxt: (content) => ipcRenderer.invoke('save-txt', content)
});
