import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { getModelsList, importModel, deleteModel, getProjectsList, createProject, deleteProject, getProjectFiles, deleteProjectFile } from './main/home.js';
import { readModel, saveTextFile, readProjectFile, saveProjectFile, saveHtmlFile } from './main/tagger.js';
import { AppUpdater, autoUpdater } from 'electron-updater';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) { app.quit(); }

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), },
  });

  //? Home
  // Models
  ipcMain.handle('get-models', () => { return getModelsList(); });
  ipcMain.handle('import-model', async () => { return await importModel(mainWindow); });
  ipcMain.handle('delete-model', async (_, modelName) => { return await deleteModel(mainWindow, modelName); });

  // Projects
  ipcMain.handle('get-projects-folders', () => getProjectsList());
  ipcMain.handle('create-project', (_, projectName) => createProject(projectName));
  ipcMain.handle('delete-project', async (_, projectName) => await deleteProject(mainWindow, projectName));

  // Project Files
  ipcMain.handle('get-project-files', (_, projectName) => getProjectFiles(projectName));
  ipcMain.handle('delete-project-file', async (_, projectName, fileName) => await deleteProjectFile(mainWindow, projectName, fileName));

  //? Tagger
  // Models
  ipcMain.handle('read-model', (_, modelName) => { return readModel(modelName); });
  // Files
  ipcMain.handle('save-txt', async (_, content) => { return await saveTextFile(mainWindow, content); });
  ipcMain.handle('read-project-file', (_, projectName, fileName) => readProjectFile(projectName, fileName));
  ipcMain.handle('save-project-file', (_, projectName, fileName, content, oldFileName) => saveProjectFile(projectName, fileName, content, oldFileName));
  ipcMain.handle('save-html', async (_, content) => { return await saveHtmlFile(mainWindow, content); });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  mainWindow.webContents.openDevTools();
};


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  autoUpdater.checkForUpdates();
});

autoUpdater.on('update-available', () => {
  console.log('Hay una nueva versión disponible.');
  autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', () => {
  console.log('No hay actualizaciones disponibles.');
});

autoUpdater.on('update-downloaded', () => {
  console.log('La actualización se ha descargado. Reiniciando la aplicación...');
  autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (error) => {
  console.error('Error en la actualización:', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==========================================
// CANALES DE BACKEND DE ENTREVISTAS
// ==========================================

import { getSessionsList, importSession, getProjectsList as getProjInterviews, createProject as createProjInterviews, deleteProject as delProjInterviews, getModelsList as getModelsInterviews, importModel as impModelInterviews } from './main/interviews/launcher.js';
import { saveModel, getModel, getModelToEdit, deleteModel as delModelInterviews } from './main/interviews/createModel.js';
import { prepareText, getJsonData, saveCurrentProgress, exportToHtml as expHtmlEntrevistas, exportToJson } from './main/interviews/tagger.js';
import { dialog } from 'electron';

// NOTA: Resolviendo colisiones de nombres de importación con alias.

//! Launcher view
ipcMain.handle('getProjects', async () => { return getProjInterviews(); }); 
ipcMain.handle('deleteProject', async (_event, name) => { return delProjInterviews(name); });
ipcMain.handle('createProject', async (_event, name) => { return createProjInterviews(name); });

ipcMain.handle('getAllModels', async () => { return getModelsInterviews(); });
ipcMain.handle('importModel', async () => { const mainWindow = BrowserWindow.getFocusedWindow(); return impModelInterviews(mainWindow); });
ipcMain.handle('deleteModel', async (_event, modelName) => { return delModelInterviews(modelName); });

ipcMain.handle('getAllSessions', async (_event, projectName) => { return getSessionsList(projectName); });

ipcMain.handle('importSession', async (_event, projectName) => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  return importSession(mainWindow, projectName);
});

//! CreateModel View
ipcMain.handle('getModel', async (_event, modelName) => { return getModel(modelName); });
ipcMain.handle('getModelToEdit', async (_event, modelName) => { return getModelToEdit(modelName); });
ipcMain.handle('saveModel', async (_event, modelData) => { return saveModel(modelData); });

//! Tagger View
ipcMain.handle('prepareText', async (_event, fileName, textContent, projectName) => {
  return prepareText(fileName, textContent, projectName);
});

ipcMain.handle('getJsonData', async (_event, fileName, projectName) => {
  return getJsonData(fileName, projectName);
});

ipcMain.handle('saveCurrentProgress', async (_event, fileName, data, projectName) => {
  return saveCurrentProgress(fileName, data, projectName);
});

ipcMain.handle('exportToHtml', async (_event, fileName, htmlContent) => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar Sesión a HTML',
    defaultPath: fileName.replace(/\.[^/.]+$/, "") + "_export.html",
    filters: [{ name: 'Páginas Web', extensions: ['html'] }, { name: 'Todos los archivos', extensions: ['*'] }]
  });
  if (canceled || !filePath) return { success: false, error: 'Exportación cancelada', canceled: true };
  return expHtmlEntrevistas(filePath, htmlContent);
});

ipcMain.handle('exportToTxt', async (_event, fileName, txtContent) => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar Sesión a TXT',
    defaultPath: fileName.replace(/\.[^/.]+$/, "") + "_export.txt",
    filters: [{ name: 'Archivos de Texto', extensions: ['txt'] }, { name: 'Todos los archivos', extensions: ['*'] }]
  });
  if (canceled || !filePath) return { success: false, error: 'Exportación cancelada', canceled: true };
  return expHtmlEntrevistas(filePath, txtContent);
});

ipcMain.handle('exportToJson', async (_event, fileName, data) => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar Sesión a JSON',
    defaultPath: fileName,
    filters: [{ name: 'Archivos JSON', extensions: ['json'] }, { name: 'Todos los archivos', extensions: ['*'] }]
  });
  if (canceled || !filePath) return { success: false, error: 'Exportación cancelada', canceled: true };
  return exportToJson(filePath, data);
});