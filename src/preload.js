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

//! Launcher view (Entrevistas)
contextBridge.exposeInMainWorld('launcherAPI', {
  getProjects: () => ipcRenderer.invoke('getProjects'),
  createProject: (name) => ipcRenderer.invoke('createProject', name),
  deleteProject: (name) => ipcRenderer.invoke('deleteProject', name),

  getAllModels: () => ipcRenderer.invoke('getAllModels'),
  importModel: () => ipcRenderer.invoke('importModel'),
  deleteModel: (name) => ipcRenderer.invoke('deleteModel', name),
  importSession: (projectName) => ipcRenderer.invoke('importSession', projectName),
  getAllSessions: (projectName) => ipcRenderer.invoke('getAllSessions', projectName),
});

//! Create model view (Entrevistas)
contextBridge.exposeInMainWorld('createModelAPI', {
  getModelToEdit: (name) => ipcRenderer.invoke('getModelToEdit', name),
  saveModel: (data) => ipcRenderer.invoke('saveModel', data),
});

//! Tagger view (Entrevistas)
contextBridge.exposeInMainWorld('taggingAPI', {
  prepareText: (fileName, textContent, projectName) => ipcRenderer.invoke('prepareText', fileName, textContent, projectName),
  getJsonData: (fileName, projectName) => ipcRenderer.invoke('getJsonData', fileName, projectName),
  getModelConfig: (modelName) => ipcRenderer.invoke('getModelToEdit', modelName),
  updateLineTags: (fileName, data) => ipcRenderer.invoke('updateLineTags', fileName, data),
  saveCurrentProgress: (fileName, data, projectName) => ipcRenderer.invoke('saveCurrentProgress', fileName, data, projectName),
  exportToHtml: (fileName, htmlContent) => ipcRenderer.invoke('exportToHtml', fileName, htmlContent),
  exportToTxt: (fileName, txtContent) => ipcRenderer.invoke('exportToTxt', fileName, txtContent),
  exportToJson: (fileName, data) => ipcRenderer.invoke('exportToJson', fileName, data)
});
