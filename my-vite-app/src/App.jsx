import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import EditorPage from './pages/EditorPage';
import EditorPageWithTutorial from './pages/EditorPageWithTutorial';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/editor/:projectId" element={<EditorPage />} />
          <Route path="/tutorial/:projectId" element={<EditorPageWithTutorial />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;