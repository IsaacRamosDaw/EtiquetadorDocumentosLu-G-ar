// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('HomeFunctions', {
  // Models
  getModels: () => ipcRenderer.invoke('get-models'),
  importModel: () => ipcRenderer.invoke('import-model'),
  deleteModel: (modelName) => ipcRenderer.invoke('delete-model', modelName),

  // Projects
  getProjectsFolders: () => ipcRenderer.invoke('get-projects-folders'),
  createProject: (projectName) => ipcRenderer.invoke('create-project', projectName),
  deleteProject: (projectName) => ipcRenderer.invoke('delete-project', projectName),

  // Project Files
  getProjectFiles: (projectName) => ipcRenderer.invoke('get-project-files', projectName),
  deleteProjectFile: (projectName, fileName) => ipcRenderer.invoke('delete-project-file', projectName, fileName),
});

contextBridge.exposeInMainWorld('TaggerFunctions', {
  readModel: (modelName) => ipcRenderer.invoke('read-model', modelName),
  saveTxt: (content) => ipcRenderer.invoke('save-txt', content),
    readProjectFile: (projectName, fileName) => ipcRenderer.invoke('read-project-file', projectName, fileName),
    saveProjectFile: (projectName, fileName, content, oldFileName) => ipcRenderer.invoke('save-project-file', projectName, fileName, content, oldFileName),
    saveHtml: (content) => ipcRenderer.invoke('save-html', content)
  });
