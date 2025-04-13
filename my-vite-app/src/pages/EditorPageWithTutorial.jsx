import { useParams } from 'react-router-dom';
import EditorPage from './EditorPage'; // Import the original editor page
import TutorialWrapper from '../components/TutorialWrapper';
import enhancedTutorialSteps from '../data/enhancedTutorialSteps';

/**
 * wrapper component adds tutorial functionality to the EditorPage
 */
function EditorPageWithTutorial() {
  const { projectId } = useParams();
  
  return (
    <TutorialWrapper 
      projectId={projectId}
      tutorialSteps={enhancedTutorialSteps}
    >
      <EditorPage />
    </TutorialWrapper>
  );
}

export default EditorPageWithTutorial;