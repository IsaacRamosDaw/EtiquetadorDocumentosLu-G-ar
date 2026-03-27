import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
// import started from 'electron-squirrel-startup';
import started from 'electron-squirrel-startup';
import { getModelsList, importModel, deleteModel, getProjectsList, createProject, deleteProject, getProjectFiles, deleteProjectFile } from './main/home.js';
import { readModel, saveTextFile, readProjectFile, saveProjectFile } from './main/tagger.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) { app.quit(); }

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), },
  });

  //! Home ipcMain
  ipcMain.handle('get-models', () => { return getModelsList(); });
  ipcMain.handle('import-model', async () => { return await importModel(mainWindow); });
  ipcMain.handle('delete-model', async (_, modelName) => { return await deleteModel(mainWindow, modelName); });
  ipcMain.handle('get-projects', () => getProjectsList());
  ipcMain.handle('create-project', (_, projectName) => createProject(projectName));
  ipcMain.handle('delete-project', async (_, projectName) => await deleteProject(mainWindow, projectName));
  ipcMain.handle('get-project-files', (_, projectName) => getProjectFiles(projectName));
  ipcMain.handle('delete-project-file', async (_, projectName, fileName) => await deleteProjectFile(mainWindow, projectName, fileName));

  //! Tagger ipcMain
  // Crear sus respectivos en el preload
  ipcMain.handle('read-model', (_, modelName) => { return readModel(modelName); });
  ipcMain.handle('save-txt', async (_, content) => { return await saveTextFile(mainWindow, content); });
  ipcMain.handle('read-project-file', (_, projectName, fileName) => readProjectFile(projectName, fileName));
  ipcMain.handle('save-project-file', (_, projectName, fileName, content, oldFileName) => saveProjectFile(projectName, fileName, content, oldFileName));

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) { mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL); }
  else { mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)); }
  // DEV TOOLS
  mainWindow.webContents.openDevTools();
};


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});