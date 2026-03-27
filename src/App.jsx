import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home.jsx';
import Tagger from './views/Tagger.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:modelName/tagger" element={<Tagger />} />
        <Route path="/:modelName/tagger/:projectName" element={<Tagger />} />
        <Route path="/:modelName/tagger/:projectName/:fileName" element={<Tagger />} />
      </Routes>
    </Router>
  )
}

export default App;