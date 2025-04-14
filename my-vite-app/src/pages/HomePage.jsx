import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

function HomePage() {
  const navigate = useNavigate();
  const sampleProjects = [
    { id: 1, name: "My First Game", lastEdited: "2 days ago" },
    { id: 2, name: "Platform Adventure", lastEdited: "Yesterday" }
  ];

  const handleCreateProject = () => {
    const newId = Math.max(...sampleProjects.map(p => p.id), 0) + 1;
    navigate(`/tutorial/${newId}`);
  };

  return (
    <div className="home-page-container">
      <div className="home-page">
        <div className="logo-container">
          <Logo />
          <h2 className="tagline">Learn as you go!</h2>
        </div>
        
        <div className="home-sidebar">
          <div className="projects-section">
            <h1>Projects</h1>
            
            <div className="project-list">
              {sampleProjects.map(project => (
                <div key={project.id} className="project-item">
                  <h2>{project.name}</h2>
                  <p>Last edited: {project.lastEdited}</p>
                </div>
              ))}
            </div>
          </div>
          
          <button onClick={handleCreateProject} className="create-project-button">
            Create New Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;