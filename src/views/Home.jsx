import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/general.css';
import '../style/home.css';

function Home() {
  //* Models tags
  const [models, setModels] = useState([]);
  //* Model selected
  const [selectedModel, setSelectedModel] = useState('');
  const navigate = useNavigate();

  //? getModels - main.js
  const fetchModels = async () => {
    try {
      const availableModels = await window.HomeFunctions.getModels();

      // console.log("availableModels");
      // console.table(availableModels);

      setModels(availableModels || []);

      // Si hay modelos, selecciona el primero en la variable "selectedModel"
      // si no hay, entrega un array vacio
      if (availableModels && availableModels.length > 0) setSelectedModel(availableModels[0]);
    }
    catch (error) { console.error("Error al obtener modelos", error); }
  };

  //? importModel - main.js
  const handleImport = async () => {
    try {
      const result = await window.HomeFunctions.importModel();
      if (result && result.success) { fetchModels(); }
    } catch (error) { console.error("Error al importar", error); }
  };

  // Si hay modelo seleccionado, navega a la página de etiquetado
  const handleContinue = () => { if (selectedModel) { navigate(`/${selectedModel}/tagger`); } };

  useEffect(() => { fetchModels(); }, []);

  return (
    <div className="home">
      <div className="glass-card">
        <div className="home-header">
          <h1 className="home-title">Etiquetador de Documentos</h1>
          <p className="home-subtitle">Selecciona o importa un modelo de etiquetas para comenzar.</p>
        </div>

        <div className="model-selector-wrapper">
          <label className="model-selector-label">Modelo de etiquetas</label>
          {models.length > 0 ? (
            <select
              className="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map((model, index) => ( <option key={index} value={model}>{model}</option> ))}
            </select>
          )
            : (<div className="no-models"> No hay modelos </div>)
          }
        </div>

        <div className="button-group">
          <button className="btn-secondary" onClick={handleImport}> Importar Modelo </button>
          {models.length > 0 && ( 
            <button className="btn-primary" onClick={handleContinue}> Continuar </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;