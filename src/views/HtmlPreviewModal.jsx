import React, { useState, useMemo } from 'react';
import '../style/htmlPreview.css';
import { parseTaggedText, generateHtmlFileContent } from '../utils/htmlGenerator';

export default function HtmlPreviewModal({ text, model, title, onClose }) {
  const [selectedTag, setSelectedTag] = useState('');
  
  const { segments, usedTagsInfo } = useMemo(() => {
    return parseTaggedText(text, model);
  }, [text, model]);

  const handleDownload = async () => {
    const htmlContent = generateHtmlFileContent(title, text, model);
    const result = await window.TaggerFunctions.saveHtml(htmlContent);
    if (result && result.success) {
      alert("Archivo HTML guardado con éxito.");
    } else if (result && result.error) {
      alert("Error al guardar: " + result.error);
    }
  };

  const currentTagCount = useMemo(() => {
    if (!selectedTag) return 0;
    return segments.filter(s => s.type === 'tag' && s.tagName === selectedTag).length;
  }, [selectedTag, segments]);

  const renderSegments = (segList) => {
    return segList.map((segment, idx) => {
      if (segment.type === 'text') {
        return <span key={idx}>{segment.value}</span>;
      } else {
        const isSelected = selectedTag === '' || segment.tagName === selectedTag;
        const isActive = selectedTag !== '' && segment.tagName === selectedTag;
        
        return (
          <span 
            key={idx}
            className={`preview-segment-tag ${isActive ? 'active-tag-highlight' : ''} ${!isSelected ? 'dimmed-tag' : ''}`}
            style={{ 
              backgroundColor: `${segment.color}33`, 
              borderBottom: `2px solid ${segment.color}`
            }}
            title={`${segment.displayName} (${segment.tagName})`}
          >
            {renderSegments(segment.children)}
          </span>
        );
      }
    });
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="glass-card preview-modal-content" onClick={e => e.stopPropagation()}>
        <div className="preview-header">
          <h2 className="preview-title" title={title}>{title || 'Documento sin título'}</h2>
          <div className="preview-actions">
            <button className="btn-secondary btn-sm" onClick={handleDownload}>
              Descargar HTML
            </button>
            <button className="close-preview-btn" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="preview-body">
          <div className="preview-sidebar">
            <div className="sidebar-section">
              <label className="tag-selector-label">Filtrar Etiqueta:</label>
              <select 
                className="tag-preview-select"
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
              >
                <option value="">Todas</option>
                {usedTagsInfo.map(t => (
                  <option key={t.tag} value={t.tag}>
                    {t.name} ({t.tag})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTag && (
              <div className="tag-count-badge">
                Apariciones: {currentTagCount}
              </div>
            )}

            <div style={{ flex: 1 }}></div>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              Visualización con colores oficiales del modelo.
            </p>
          </div>

          <div className="preview-main">
            {renderSegments(segments)}
          </div>
        </div>
      </div>
    </div>
  );
}