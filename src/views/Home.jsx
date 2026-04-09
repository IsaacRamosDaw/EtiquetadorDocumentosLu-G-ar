import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/general.css';
import '../style/home.css';

function Home() {
  const navigate = useNavigate();
  //* Models tags
  const [models, setModels] = useState([]);
  //* Model selected
  const [selectedModel, setSelectedModel] = useState('');
  //* Projects state
  const [projects, setProjects] = useState([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  //? fetchProjects
  const fetchProjects = async () => {
    try {
      const projNames = await window.HomeFunctions.getProjectsFolders();
      const projData = await Promise.all(
        projNames.map(async (p) => {
          const files = await window.HomeFunctions.getProjectFiles(p);
          return { name: p, files };
        })
      );
      setProjects(projData);
    }
    catch (error) { console.error("Error al obtener proyectos", error); }
  };

  //? getModels
  const getAllModels = async () => {
    try {
      const availableModels = await window.HomeFunctions.getModels();
      setModels(availableModels || []);
      if (availableModels && availableModels.length > 0) setSelectedModel(availableModels[0]);
    }
    catch (error) { console.error("Error al obtener modelos", error); }
  };

  //? importModel
  const handleImport = async () => {
    try {
      const result = await window.HomeFunctions.importModel();
      if (result && result.success) { getAllModels(); }
    } catch (error) { console.error("Error al importar", error); }
  };

  const handleContinue = () => { if (selectedModel) { navigate(`/${selectedModel}/tagger`); } };

  //? deleteModel
  const handleDelete = async () => {
    if (!selectedModel) return;
    try {
      const result = await window.HomeFunctions.deleteModel(selectedModel);
      if (result && result.success) { getAllModels(); }
    } catch (error) { console.error("Error al eliminar", error); }
  };

  //? Project actions
  const handleCreateProjectAction = async () => {
    if (!newProjectName.trim()) {
      alert("Por favor, escribe un nombre.");
      return;
    }
    const result = await window.HomeFunctions.createProject(newProjectName.trim());
    if (result && result.success) {
      setShowNewProjectModal(false);
      setNewProjectName('');
      fetchProjects();
    } else {
      alert("Error: " + (result ? result.error : 'Desconocido'));
    }
  };

  const handleDeleteProject = async (projectName) => {
    const result = await window.HomeFunctions.deleteProject(projectName);
    if (result && result.success) fetchProjects();
  };

  const handleDeleteFile = async (projectName, fileName) => {
    const result = await window.HomeFunctions.deleteProjectFile(projectName, fileName);
    if (result && result.success) fetchProjects();
  };

  const handleEditFile = (projectName, fileName) => {
    if (!selectedModel) {
      alert("Por favor, selecciona un modelo de etiquetas arriba antes de editar un archivo.");
      return;
    }
    navigate(`/${selectedModel}/tagger/${projectName}/${fileName}`);
  };

  useEffect(() => {
    getAllModels();
    fetchProjects();
  }, []);

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
              {models.map((model, index) => (<option key={index} value={model}>{model}</option>))}
            </select>
          )
            : (<div className="no-models"> No hay modelos </div>)
          }
        </div>

        <div className="button-group">
          <button className="btn-secondary" onClick={handleImport}> Importar Modelo </button>
          {models.length > 0 && (
            <>
              <button className="btn-secondary" onClick={handleDelete}> Eliminar </button>
              <button className="btn-primary" onClick={handleContinue}> Continuar </button>
            </>
          )}
        </div>

        {/* Projects Section */}
        <div className="projects-section">
          <div className="projects-header">
            <h2 className="projects-title">Proyectos</h2>
            <button className="new-project-btn" onClick={() => setShowNewProjectModal(true)}>+ Nuevo</button>
          </div>

          {projects.length === 0 ? (
            <div className="no-models" style={{ fontSize: '0.95rem', padding: '1.5rem' }}>No hay proyectos creados</div>
          ) : (
            projects.map(proj => (
              <div key={proj.name} className="project-item">
                <div className="project-item-header">
                  <span className="project-name">📁 {proj.name}</span>
                  <button className="delete-project-btn" onClick={() => handleDeleteProject(proj.name)} title="Eliminar proyecto">
                    ✕
                  </button>
                </div>

                <div className="file-list">
                  {proj.files.length === 0 ? (
                    <div className="file-name" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>Carpeta vacía</div>
                  ) : (
                    proj.files.map(file => (
                      <div key={file} className="file-item">
                        <span className="file-name">📄 {file}</span>
                        <div className="file-actions">
                          <button className="icon-btn" onClick={() => handleEditFile(proj.name, file)} title="Editar archivo">✏️</button>
                          <button className="icon-btn delete" onClick={() => handleDeleteFile(proj.name, file)} title="Eliminar archivo">🗑️</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showNewProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '400px', padding: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.4rem' }}>Nuevo Proyecto</h3>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre del Proyecto:</label>
            <input
              type="text"
              className="model-select"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="Ej. Mi Proyecto"
              style={{ marginBottom: '1.5rem', width: '100%', padding: '0.8rem', boxSizing: 'border-box' }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowNewProjectModal(false)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleCreateProjectAction}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;