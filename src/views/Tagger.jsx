import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/tagger.css';

export default function Tagger() {
  const { modelName, projectName, fileName } = useParams();
  const [model, setModel] = useState(null);
  const [text, setText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  
  // Projects tracking
  const [docName, setDocName] = useState(fileName ? fileName.replace('.txt', '') : '');
  const [projectsList, setProjectsList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedSaveProject, setSelectedSaveProject] = useState(projectName || '');

  const navigate = useNavigate();
  const textAreaRef = useRef(null);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const data = await window.TaggerFunctions.readModel(modelName);
        if (data) {
          setModel(data);
          // Auto-select first positional attribute if it exists
          if (data.positional_attributes && data.positional_attributes.values && data.positional_attributes.values.length > 0) {
            setSelectedPosition(data.positional_attributes.values[0].tag);
          }
        }
      } catch (err) {
        console.error("Error al cargar modelo:", err);
      }
    };

    if (modelName) fetchModel();

    // Fetch projects for the save modal
    if (window.HomeFunctions) {
      window.HomeFunctions.getProjectsFolders().then(list => {
        setProjectsList(list || []);
        if (!selectedSaveProject && list && list.length > 0) {
          setSelectedSaveProject(list[0]);
        }
      });
    }

    // If editing, load the text
    if (projectName && fileName) {
      window.TaggerFunctions.readProjectFile(projectName, fileName).then(content => {
        if (content) setText(content);
      });
    }
  }, [modelName, projectName, fileName]);

  const insertTag = (tagType, tagValue, tagLocValue) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentScrollTop = textarea.scrollTop;
    
    // Si no hay texto seleccionado, no hacemos el reemplazo (opcional, o le podemos insertar tags vacíos)
    if (start === end) {
      alert("Por favor selecciona primero el texto que deseas etiquetar.");
      return;
    }

    const selectedText = text.substring(start, end);
    let insertion = '';

    if (tagType === 'entity') {
      insertion = `<${tagValue}>${selectedText}</${tagValue}>`;
    } else if (tagType === 'attribute') {
      if (!selectedPosition) {
        alert("Por favor selecciona un atributo de posición primero.");
        return;
      }
      insertion = `<${tagValue} ${tagLocValue}="${selectedPosition}">${selectedText}</${tagValue}>`;
    }

    const newText = text.substring(0, start) + insertion + text.substring(end);
    setText(newText);
    
    // Restore focus and selection to right after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
      textarea.scrollTop = currentScrollTop;
    }, 0);
  };

  const handleSaveTxt = async () => {
    if (!text.trim()) {
      alert("El documento está vacío. Escribe algo antes de descargar.");
      return;
    }
    const result = await window.TaggerFunctions.saveTxt(text);
    if (result && result.error) {
      alert("Error al guardar: " + result.error);
    }
  };

  const handleSaveProjectAction = async () => {
    if (!docName.trim()) {
      alert("Por favor, escribe un nombre para el archivo en la barra superior.");
      return;
    }
    if (!selectedSaveProject) {
      alert("Por favor, selecciona un proyecto.");
      return;
    }
    if (!text.trim()) {
      alert("El documento está vacío. Escribe algo antes de guardar.");
      return;
    }
    
    let finalFileName = docName.trim();
    if (!finalFileName.endsWith('.txt')) finalFileName += '.txt';

    const result = await window.TaggerFunctions.saveProjectFile(selectedSaveProject, finalFileName, text, fileName || null);
    
    if (result && result.success) {
      alert("Archivo guardado con éxito en el proyecto: " + selectedSaveProject);
      setShowSaveModal(false);
      navigate(`/${modelName}/tagger/${selectedSaveProject}/${finalFileName}`, { replace: true });
    } else {
      alert("Error al guardar en proyecto: " + (result ? result.error : 'Desconocido'));
    }
  };

  if (!model) return <div className="tagger-loading">Cargando modelo...</div>;

  return (
    <div className="tagger-container">
      <div className="tagger-header">
        <button className="btn-back" onClick={() => navigate('/')}>&larr; Volver</button>
        
        <div className="tagger-title-container">
          <input 
            type="text" 
            className="doc-name-input" 
            placeholder="Escribe un nombre para el archivo" 
            value={docName}
            onChange={e => setDocName(e.target.value)}
          />
          <span className="model-name-label">Modelo: {model.title || modelName}</span>
        </div>

        <div style={{ flex: 1 }}></div>
        <button className="btn-secondary btn-sm mr-2" onClick={() => setShowSaveModal(true)}>
          Guardar
        </button>
        <button className="btn-primary btn-sm" onClick={handleSaveTxt}>
          Descargar TXT
        </button>
      </div>

      <div className="tagger-layout">
        <div className="tagger-main">
          <textarea
            ref={textAreaRef}
            className="tagger-textarea"
            placeholder="Escribe o pega aquí el texto a etiquetar...&#10;1. Selecciona el texto.&#10;2. Elige la posición en la barra lateral.&#10;3. Haz clic en un Atributo o Entidad para etiquetar."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="tagger-sidebar">
          {/* Positional Attributes */}
          {model.positional_attributes && model.positional_attributes.values && model.positional_attributes.values.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-subtitle">{model.positional_attributes.name || "Posición Actual"}</h3>
              <select 
                className="position-select"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                {model.positional_attributes.values.map((pos, idx) => (
                  <option key={idx} value={pos.tag} title={pos.description || pos.name}>
                    {pos.name} ({pos.tag})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attributes */}
          {model.attributes && model.attributes.values && model.attributes.values.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-subtitle">{model.attributes.name || "Atributos"}</h3>
              <div className="button-grid">
                {model.attributes.values.map((attr, idx) => (
                  <button 
                    key={idx} 
                    className="tag-btn attr-btn"
                    title={attr.description || attr.name}
                    onClick={() => insertTag('attribute', attr.tag, attr.value)}
                  >
                    <span>{attr.name}</span>
                    <span className="tag-btn-shortcode">&lt;{attr.tag}&gt;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Entities */}
          {model.entities && model.entities.values && model.entities.values.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-subtitle">{model.entities.name || "Entidades"}</h3>
              <div className="button-grid">
                {model.entities.values.map((ent, idx) => (
                  <button 
                    key={idx} 
                    className="tag-btn entity-btn"
                    title={ent.description || ent.name}
                    onClick={() => insertTag('entity', ent.tag)}
                  >
                    <span>{ent.name}</span>
                    <span className="tag-btn-shortcode">&lt;{ent.tag}&gt;</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 className="modal-title">Guardar Archivo</h3>
            
            <label className="modal-label">Selecciona un Proyecto:</label>
            <select 
              className="model-select modal-select-wrapper" 
              value={selectedSaveProject} 
              onChange={e => setSelectedSaveProject(e.target.value)}
            >
              {projectsList.length === 0 ? (
                <option value="">-- No hay proyectos --</option>
              ) : (
                projectsList.map(p => <option key={p} value={p}>{p}</option>)
              )}
            </select>

            <div className="modal-actions">
              <button className="btn-secondary modal-btn" onClick={() => setShowSaveModal(false)}>Cancelar</button>
              <button className="btn-primary modal-btn" onClick={handleSaveProjectAction}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}