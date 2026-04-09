import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../style/general.css';
import '../style/home.css';

export default function Home() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  // Lista de nombres de archivos de modelos disponibles ej: ["Persona.json", "Legal.json"]
  const [selectedModel, setSelectedModel] = useState('');
  // Modelo seleccionado en el desplegable
  const [projects, setProjects] = useState([]);
  // Array de los projectos que son objetos ej: [{ name: 'Carpeta', files: ['doc.txt'] }]
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  // Nombre en el modal para crear un nuevo proyecto
  const [newProjectName, setNewProjectName] = useState('');
  // Nombre del input del modal que aparece

  // ==========================================
  //! MODEL FUNCTIONS

  /**
   ** Obtiene los modelos de etiquetas disponibles.
   * Si hay modelos, selecciona el primero por defecto para evitar que el selector quede vacío.
   */
  const getAllModels = async () => {
    try {
      const availableModels = await window.HomeFunctions.getModels();
      setModels(availableModels || []);
      if (availableModels && availableModels.length > 0) setSelectedModel(availableModels[0]);
    }
    catch (e) { console.error("Error al obtener modelos", e); }
  };

  /**
   ** Abre el buscador de archivos del sistema para copiar un nuevo modelo a la carpeta de la app.
   */
  const handleImportModel = async () => {
    try {
      const result = await window.HomeFunctions.importModel();
      if (result && result.success) { getAllModels(); }
    }
    catch (e) { console.error("Error al importar modelo", e); }
  };

  /**
   ** Borra físicamente el archivo del modelo seleccionado.
   */
  const handleDeleteModel = async () => {
    if (!selectedModel) return;

    try {
      const result = await window.HomeFunctions.deleteModel(selectedModel);
      if (result && result.success) { getAllModels(); }
    } catch (error) { console.error("Error al eliminar", error); }
  };
  
  // ==========================================
  //! PROJECT FUNCTIONS

  /**
   ** Obtiene la estructura de carpetas y archivos desde AppData.
   * Se espera que 'getProjectsFolders' devuelva un array de strings (nombres de carpetas).
   * Luego, para cada carpeta, 'getProjectFiles' devuelve los nombres de archivos dentro.
   */
  const fetchProjects = async () => {
    try {
      const projectNames = await window.HomeFunctions.getProjectsFolders();

      const projectsData = await Promise.all(
        projectNames.map(async (projectName) => {
          const files = await window.HomeFunctions.getProjectFiles(projectName);
          return { name: projectName, files };
        })
      );

      setProjects(projectsData);
    }
    catch (e) { console.error("Error al obtener proyectos", e); }
  };

  /**
   ** Crea una nueva carpeta de proyecto. Valida que el nombre no esté vacío.
   */
  const handleCreateProjectAction = async () => {
    if (!newProjectName.trim()) {
      alert("Por favor, escribe un nombre.");
      return;
    }
    const result = await window.HomeFunctions.createProject(newProjectName.trim());
    if (result && result.success) {
      setShowNewProjectModal(false); // Cerramos el modal
      setNewProjectName('');         // Limpiamos el input
      fetchProjects();               // Recargamos la lista de proyectos
    } else {
      alert("Error: " + (result ? result.error : 'Desconocido'));
    }
  };

  /**
   ** Borra una carpeta de proyecto completa.
   * @param {string} projectName - Nombre de la carpeta a eliminar.
   */
  const handleDeleteProject = async (projectName) => {
    const result = await window.HomeFunctions.deleteProject(projectName);
    if (result && result.success) fetchProjects();
  };

  /**
   ** Borra un archivo específico (.txt) dentro de una carpeta de proyecto.
   */
  const handleDeleteFile = async (projectName, fileName) => {
    const result = await window.HomeFunctions.deleteProjectFile(projectName, fileName);
    if (result && result.success) fetchProjects();
  };

  // ==========================================
  //! LIFECYCLE
  /**
   ** Se ejecuta una sola vez cuando el componente se monta (carga) por primera vez.
   */
  useEffect(() => {
    getAllModels();
    fetchProjects();
  }, []);
  /**
   ** Navega al tagger sin elegir ningún texto
   */
  const handleContinue = () => { if (selectedModel) navigate(`/${selectedModel}/tagger`); };

  /**
   ** Navega al tagger de un archivo específico.
   * Obliga a tener un modelo seleccionado para saber qué etiquetas usar al editar.
   */
  const handleEditFile = (projectName, fileName) => {
    if (!selectedModel) {
      alert("Por favor, selecciona un modelo de etiquetas arriba antes de editar un archivo.");
      return;
    }
    // La ruta incluye el modelo, el proyecto y el archivo para que el Tagger sepa qué cargar
    navigate(`/${selectedModel}/tagger/${projectName}/${fileName}`);
  };

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
          <button className="btn-secondary" onClick={handleImportModel}> Importar Modelo </button>
          {models.length > 0 && (
            <>
              <button className="btn-secondary" onClick={handleDeleteModel}> Eliminar </button>
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

// export default Home;