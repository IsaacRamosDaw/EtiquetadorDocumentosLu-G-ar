import fs from 'node:fs';
import path from 'node:path';
import { dialog } from 'electron';
import { getModelsPath, getProjectPath } from './paths.js';

/**
 * LEE EL MODELO DE ETIQUETAS (JSON)
 * @param {string} modelName - Nombre del archivo del modelo (ej: "medicina.json")
 * @returns {Object|null} - Devuelve el JSON convertido a objeto JS o null si falla.
 */
export const readModel = (modelName) => {
  const modelsPath = getModelsPath(); // Obtiene la ruta de la carpeta /models
  const filePath = path.join(modelsPath, modelName); // Une la carpeta con el nombre del archivo
  
  if (fs.existsSync(filePath)) {
    // Leemos el archivo como texto plano (utf8)
    const data = fs.readFileSync(filePath, 'utf8');
    // Convertimos el texto JSON en un objeto de JavaScript para que React pueda usarlo
    return JSON.parse(data);
  }
  return null;
};

/**
 * EXPORTAR TEXTO (Diálogo de Windows)
 * @param {BrowserWindow} mainWindow - Ventana principal para que el diálogo sea "modal"
 * @param {string} content - El texto ya etiquetado que queremos guardar
 */
export const saveTextFile = async (mainWindow, content) => {
  // Abre la ventana nativa de "Guardar como..." de Windows/Mac
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar archivo de texto',
    defaultPath: 'documento_etiquetado.txt',
    filters: [{ name: 'Documento de texto', extensions: ['txt'] }]
  });

  // Si el usuario cierra la ventana o pulsa cancelar, no hacemos nada
  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    // Escribimos el contenido en la ruta que el usuario eligió en el diálogo
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (error) {
    console.error("Error saving file:", error);
    return { success: false, error: error.message };
  }
};

/**
 * LEER UN ARCHIVO DENTRO DE UN PROYECTO
 * @param {string} projectName - Carpeta del proyecto
 * @param {string} fileName - Nombre del .txt
 */
export const readProjectFile = (projectName, fileName) => {
  const projectPath = getProjectPath(projectName);
  const filePath = path.join(projectPath, fileName);
  
  if (fs.existsSync(filePath)) {
    // Devuelve el contenido del archivo para cargarlo en el editor
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
};

/**
 * GUARDAR CAMBIOS EN UN PROYECTO (Y GESTIONAR RENOMBRAMIENTO)
 * @param {string} projectName - Carpeta del proyecto
 * @param {string} fileName - Nuevo nombre del archivo
 * @param {string} content - Texto con las etiquetas añadidas
 * @param {string} oldFileName - (Opcional) Nombre anterior para borrarlo si el usuario lo cambió
 */
export const saveProjectFile = (projectName, fileName, content, oldFileName) => {
  const projectPath = getProjectPath(projectName);
  const filePath = path.join(projectPath, fileName);
  
  try {
    // LÓGICA DE RENOMBRADO: Si el nombre actual es distinto al viejo...
    if (oldFileName && oldFileName !== fileName) {
      const oldFilePath = path.join(projectPath, oldFileName);
      // Borramos el archivo viejo para que no queden duplicados
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Guardamos el contenido nuevo (o sobreescribimos el existente)
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error("Error saving project file:", error);
    return { success: false, error: error.message };
  }
};

/**
 * EXPORTAR HTML (Diálogo de Windows)
 * @param {BrowserWindow} mainWindow - Ventana principal
 * @param {string} content - El HTML generado
 */
export const saveHtmlFile = async (mainWindow, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar archivo HTML',
    defaultPath: 'documento_transformado.html',
    filters: [{ name: 'Archivo HTML', extensions: ['html'] }]
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (error) {
    console.error("Error saving HTML file:", error);
    return { success: false, error: error.message };
  }
};