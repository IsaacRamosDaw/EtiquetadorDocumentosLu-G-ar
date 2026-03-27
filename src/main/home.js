import fs from 'node:fs';
import path from 'node:path';
import { dialog } from 'electron';
import { getModelsPath, getProjectsBasePath, getProjectPath } from './paths.js';

// Ruta a la que va:
// C:\Users\user\AppData\Roaming\etiquetadordocumentos\data\models

//* Lista de modelos para elegir
//? {fetchModels}
export const getModelsList = () => {
  const modelsPath = getModelsPath();

  // Filtra los archivos que sean .json
  return fs.readdirSync(modelsPath).filter(file => file.endsWith('.json'));
};

//* Importar modelo
//? {handleImport}
export const importModel = async (mainWindow) => {
  const modelsPath = getModelsPath();

  console.log("modelsPath");
  console.log(modelsPath);

  // Abre el diálogo para seleccionar un archivo JSON
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Seleccionar modelo JSON', 
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  });

  // Si se cancela o no se selecciona ningún archivo
  if (canceled || filePaths.length === 0) { return { success: false, canceled: true }; }

  // Copia el archivo seleccionado a la carpeta de modelos
  const sourcePath = filePaths[0];
  const fileName = path.basename(sourcePath);
  const destPath = path.join(modelsPath, fileName);

  // console.log("fileName");
  // console.log(fileName);
  // console.log("destPath");
  // console.log(destPath);

  // Intenta copiar el archivo
  try {
    fs.copyFileSync(sourcePath, destPath);
    return { success: true, fileName };
  } catch (error) {
    console.error("Error importing model:", error);
    return { success: false, error: error.message };
  }
};

//* Eliminar modelo
//? {handleDelete}
export const deleteModel = async (mainWindow, modelName) => {
  const modelsPath = getModelsPath();
  const filePath = path.join(modelsPath, modelName);

  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancelar', 'Eliminar'],
    defaultId: 1,
    cancelId: 0,
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar el modelo "${modelName}"?`,
    detail: 'Esta acción no se puede deshacer.'
  });

  if (response === 1) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }
      return { success: false, error: "El archivo no existe" };
    } catch (error) {
      console.error("Error deleting model:", error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
};

// ==========================================
// PROJECT MANAGEMENT (HOME)
// ==========================================

export const getProjectsList = () => {
  const projectsPath = getProjectsBasePath();
  try {
    return fs.readdirSync(projectsPath).filter(file => {
      return fs.statSync(path.join(projectsPath, file)).isDirectory();
    });
  } catch (err) {
    return [];
  }
};

export const createProject = (projectName) => {
  try {
    getProjectPath(projectName); // Creates dir automatically
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteProject = async (mainWindow, projectName) => {
  const projectPath = getProjectPath(projectName);
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancelar', 'Eliminar'],
    defaultId: 1,
    cancelId: 0,
    title: 'Eliminar Proyecto',
    message: `¿Estás seguro de que deseas eliminar el proyecto "${projectName}" y todo su contenido?`,
    detail: 'Esta acción no se puede deshacer.'
  });

  if (response === 1) {
    try {
      fs.rmSync(projectPath, { recursive: true, force: true });
      return { success: true };
    } catch (error) {
      console.error("Error deleting project:", error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
};

export const getProjectFiles = (projectName) => {
  try {
    const projectPath = getProjectPath(projectName);
    return fs.readdirSync(projectPath).filter(file => file.endsWith('.txt'));
  } catch (error) {
    console.error("Error reading project files:", error);
    return [];
  }
};

export const deleteProjectFile = async (mainWindow, projectName, fileName) => {
  const projectPath = getProjectPath(projectName);
  const filePath = path.join(projectPath, fileName);

  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancelar', 'Eliminar'],
    defaultId: 1,
    cancelId: 0,
    title: 'Eliminar Archivo',
    message: `¿Estás seguro de eliminar el archivo "${fileName}" del proyecto "${projectName}"?`,
    detail: 'Esta acción no se puede deshacer.'
  });

  if (response === 1) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }
      return { success: false, error: "El archivo no existe" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
};