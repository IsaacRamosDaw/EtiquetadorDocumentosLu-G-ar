import fs from 'fs';
import path from 'node:path';
import { dialog } from 'electron';
import { getModelsPath } from './paths.js';

// Ruta a la que va:
// C:\Users\user\AppData\Roaming\etiquetadordocumentos\data\models

//* Lista de modelos para elegir
//? {fetchModels - home.jsx}
export const getModelsList = () => {
  const modelsPath = getModelsPath();

  // Filtra los archivos que sean .json
  return fs.readdirSync(modelsPath).filter(file => file.endsWith('.json'));
};

//* Importar modelo
//? {handleImport - home.jsx}
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
