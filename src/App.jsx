import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalHome from './views/GlobalHome.jsx';
import Home from './views/Home.jsx';
import Tagger from './views/Tagger.jsx';
import LauncherView from './views/interviews/LauncherView.jsx';
import CreateModelView from './views/interviews/CreateModelView.jsx';
import TaggerView from './views/interviews/TaggerView.jsx';
import TextCreatorView from './views/interviews/TextCreatorView.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalHome />} />
        
        {/* Rutas de Documentos */}
        <Route path="/documentos" element={<Home />} />
        <Route path="/documentos/:modelName/tagger" element={<Tagger />} />
        <Route path="/documentos/:modelName/tagger/:projectName" element={<Tagger />} />
        <Route path="/documentos/:modelName/tagger/:projectName/:fileName" element={<Tagger />} />

        {/* Rutas de Entrevistas */}
        <Route path="/entrevistas" element={<LauncherView />} />
        <Route path="/entrevistas/create-model" element={<CreateModelView />} />
        <Route path="/entrevistas/edit-model/:modelName" element={<CreateModelView />} />
        <Route path="/entrevistas/tagger/:projectName/:fileName/:modelName" element={<TaggerView />} />
        <Route path="/entrevistas/text-creator" element={<TextCreatorView />} />
      </Routes>
    </Router>
  )
}

export default App;