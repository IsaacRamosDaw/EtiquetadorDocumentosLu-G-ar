import path from 'path';
import fs from 'fs';
import { app } from 'electron';

/**
 ** 1. OBTENER RUTA BASE DE DATOS
 * Localiza la carpeta "AppData/Roaming" del usuario y crea una subcarpeta 'data'.
 * Es la raíz de todo el almacenamiento de la aplicación.
 */
const getUserDataPath = () => {
  const userDataPath = app.getPath('userData');
  const dataPath = path.join(userDataPath, 'data');

  if (!fs.existsSync(dataPath)) 
    {  fs.mkdirSync(dataPath, { recursive: true });  }

  return dataPath;
};

/**
 ** 2. RUTA DE PROYECTOS
 * Crea y devuelve la ruta donde se listarán todas las carpetas de proyectos.
 * Ubicación: %appdata%/etiquetadordocumentos/data/projects
 */
export const getProjectsBasePath = () => {
  const projectsPath = path.join(getUserDataPath(), 'projects');
  if (!fs.existsSync(projectsPath)) 
    { fs.mkdirSync(projectsPath, { recursive: true }); }

  return projectsPath;
};

/**
 ** 3. RUTA DE UN PROYECTO ESPECÍFICO
 * Crea una carpeta con el nombre del proyecto seleccionado por el usuario.
 * @param {string} projectName - El nombre que el usuario le dio al proyecto.
 */
export const getProjectPath = (projectName) => {
  const projectPath = path.join(getProjectsBasePath(), projectName);
  // Importante: Aquí se crea la subcarpeta específica para los archivos de ESE proyecto
  if (!fs.existsSync(projectPath)) 
    { fs.mkdirSync(projectPath, { recursive: true }); }
  return projectPath;
};

/**
 ** 4. RUTA DE DOCUMENTOS GENERALES
 * Útil si decides guardar borradores o archivos temporales fuera de los proyectos.
 * Ubicación: %appdata%/etiquetadordocumentos/data/documents
 */
export const getDocumentsPath = () => {
  const documentsPath = path.join(getUserDataPath(), 'documents');

  if (!fs.existsSync(documentsPath)) 
    { fs.mkdirSync(documentsPath, { recursive: true }); }
  
  return documentsPath;
};

/**
 ** 5. RUTA DE MODELOS DE ETIQUETAS
 * Aquí es donde se guardarán los archivos JSON o TXT que definen las etiquetas (PERSONA, LUGAR, etc).
 * Ubicación: %appdata%/etiquetadordocumentos/data/models
 */
export const getModelsPath = () => {
  const modelsPath = path.join(getUserDataPath(), 'models');

  if (!fs.existsSync(modelsPath)) 
    { fs.mkdirSync(modelsPath, { recursive: true }); }
  
  return modelsPath;
};