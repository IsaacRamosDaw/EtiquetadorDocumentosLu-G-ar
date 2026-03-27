import fs from 'node:fs';
import path from 'node:path';
import { dialog } from 'electron';
import { getModelsPath, getProjectPath } from './paths.js';

// Ruta a la que va:
// C:\Users\user\AppData\Roaming\etiquetadordocumentos\data\models

//* Leer el contenido de un modelo
export const readModel = (modelName) => {
  const modelsPath = getModelsPath();
  const filePath = path.join(modelsPath, modelName);
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return null;
};

//* Guardar texto como TXT dialog
export const saveTextFile = async (mainWindow, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar archivo de texto',
    defaultPath: 'documento_etiquetado.txt',
    filters: [{ name: 'Documento de texto', extensions: ['txt'] }]
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (error) {
    console.error("Error saving file:", error);
    return { success: false, error: error.message };
  }
};

//* Funciones de Proyectos (Tagger)
export const readProjectFile = (projectName, fileName) => {
  const projectPath = getProjectPath(projectName);
  const filePath = path.join(projectPath, fileName);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
};

export const saveProjectFile = (projectName, fileName, content, oldFileName) => {
  const projectPath = getProjectPath(projectName);
  const filePath = path.join(projectPath, fileName);
  
  try {
    if (oldFileName && oldFileName !== fileName) {
      const oldFilePath = path.join(projectPath, oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error("Error saving project file:", error);
    return { success: false, error: error.message };
  }
};
