// Funciones para el uso de la appdata

import path from 'path';
import fs from 'fs';

import { app } from 'electron';

//* Ruta base de los datos ("%appdata%/etiquetador-data")
const getUserDataPath = () => {
  const userDataPath = app.getPath('userData');
  const dataPath = path.join(userDataPath, 'data');

  if (!fs.existsSync(dataPath)) { fs.mkdirSync(dataPath, { recursive: true }); }

  return dataPath;
};

export const getProjectPath = (projectName) => {
  const projectPath = path.join(getUserDataPath(), projectName);
  if (!fs.existsSync(projectPath)) { fs.mkdirSync(projectPath, { recursive: true }); }
  return projectPath;
};

export const getDocumentsPath = () => {
  const documentsPath = path.join(getUserDataPath(), 'documents');
  if (!fs.existsSync(documentsPath)) { fs.mkdirSync(documentsPath, { recursive: true }); }
  return documentsPath;
};

export const getModelsPath = () => {
  const modelsPath = path.join(getUserDataPath(), 'models');
  if (!fs.existsSync(modelsPath)) {
    fs.mkdirSync(modelsPath, { recursive: true });
  }
  return modelsPath;
};
