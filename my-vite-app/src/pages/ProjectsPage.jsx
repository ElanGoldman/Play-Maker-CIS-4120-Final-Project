import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

function ProjectsPage() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'My First Game', lastEdited: '2 days ago' },
    { id: 2, name: 'Platform Adventure', lastEdited: 'Yesterday' },
    { id: 3, name: 'New Project', lastEdited: 'Just now' }
  ]);
  
  const navigate = useNavigate();
  
  const createNewProject = () => {
    const newId = projects.length + 1;
    const newProject = {
      id: newId,
      name: `New Project ${newId}`,
      lastEdited: 'Just now'
    };
    
    setProjects([...projects, newProject]);
    navigate(`/tutorial/${newId}`);
  };
  
  return (
    <div className="projects-page">
      <header>
        <Logo small />
      </header>
      
      <h1>Projects</h1>
      
      <div className="project-list">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <h2>{project.name}</h2>
            <p>Last edited: {project.lastEdited}</p>
            <Link to={`/editor/${project.id}`} className="button">Open</Link>
          </div>
        ))}
      </div>
      
      <button onClick={createNewProject} className="create-button">
        Create New Project
      </button>
    </div>
  );
}

export default ProjectsPage;