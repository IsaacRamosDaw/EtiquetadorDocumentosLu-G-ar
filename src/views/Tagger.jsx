import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/tagger.css';

export default function Tagger() {
  const { modelName } = useParams();
  const [model, setModel] = useState(null);
  const [text, setText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const navigate = useNavigate();
  const textAreaRef = useRef(null);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const data = await window.HomeFunctions.readModel(modelName);
        if (data) {
          setModel(data);
          // Auto-select first positional attribute if it exists
          if (data.positional_attributes && data.positional_attributes.length > 0) {
            const firstGroup = data.positional_attributes[0];
            if (firstGroup.values && firstGroup.values.length > 0) {
              setSelectedPosition(firstGroup.values[0].tag);
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar modelo:", err);
      }
    };
    if (modelName) fetchModel();
  }, [modelName]);

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
    const result = await window.HomeFunctions.saveTxt(text);
    if (result && result.error) {
      alert("Error al guardar: " + result.error);
    }
  };

  if (!model) return <div className="tagger-loading">Cargando modelo...</div>;

  return (
    <div className="tagger-container">
      <div className="tagger-header">
        <button className="btn-back" onClick={() => navigate('/')}>&larr; Volver</button>
        <h2 className="tagger-title">{model.title || modelName}</h2>
        <div style={{ flex: 1 }}></div>
        <button className="btn-primary" onClick={handleSaveTxt} style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}>
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
          {model.positional_attributes && model.positional_attributes.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-subtitle">{model.positional_attributes[0].name || "Posición Actual"}</h3>
              <select 
                className="position-select"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                {model.positional_attributes[0].values.map((pos, idx) => (
                  <option key={idx} value={pos.tag} title={pos.description || pos.name}>
                    {pos.name} ({pos.tag})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attributes */}
          {model.values && model.values.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-subtitle">{model.attributes || "Atributos"}</h3>
              <div className="button-grid">
                {model.values.map((attr, idx) => (
                  <button 
                    key={idx} 
                    className="tag-btn attr-btn"
                    title={attr.description || attr.name}
                    onClick={() => insertTag('attribute', attr.tag, attr.value)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{attr.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.5rem', fontFamily: 'monospace' }}>&lt;{attr.tag}&gt;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Entities */}
          {model.entities && model.entities.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-subtitle">Entidades</h3>
              <div className="button-grid">
                {model.entities.map((ent, idx) => (
                  <button 
                    key={idx} 
                    className="tag-btn entity-btn"
                    title={ent.description || ent.name}
                    onClick={() => insertTag('entity', ent.tag)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{ent.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.5rem', fontFamily: 'monospace' }}>&lt;{ent.tag}&gt;</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}