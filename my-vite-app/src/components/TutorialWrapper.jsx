import { useState, useEffect, useRef } from 'react';
import TutorialSystem from './TutorialSystem';
import { 
  isTutorialCompleted, 
  completeTutorial, 
  resetTutorial,
  loadTutorialState,
  saveTutorialState,
  recordStepTransition,
  recordTutorialCompletion,
  recordTutorialRestart,
  findElementWithRetry
} from '../utils/TutorialHelper';

function TutorialWrapper({ children, projectId, tutorialSteps }) {
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const observerRef = useRef(null);
  const tutorialOverlayRef = useRef(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    if (isTutorialCompleted(projectId)) {
      setShowTutorial(false);
      setHasSeenTutorial(true);
    }
    
    const savedState = loadTutorialState(projectId);
    if (savedState && savedState.currentStep !== undefined) {
      setTutorialStep(savedState.currentStep);
    }
  }, [projectId]);
  
  useEffect(() => {
    if (showTutorial) {
      saveTutorialState(projectId, {
        currentStep: tutorialStep,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [tutorialStep, showTutorial, projectId]);

  const handleStepChange = (newStep) => {
    recordStepTransition(projectId, tutorialStep, newStep);
    setTutorialStep(newStep);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    recordTutorialCompletion(projectId);
    completeTutorial(projectId);
  };

  const handleRestartTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
    recordTutorialRestart(projectId);
    resetTutorial(projectId);
  };

  useEffect(() => {
    if (showTutorial && tutorialSteps[tutorialStep]) {
      const currentStep = tutorialSteps[tutorialStep];
      let cleanupFunctions = [];
      
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      if (currentStep.autoAdvance) {
        const { 
          selector, 
          event, 
          condition, 
          delay = 500,
          checkInterval = 1000
        } = currentStep.autoAdvance;
        
        const setupAutoAdvance = async () => {
          try {
            const element = await findElementWithRetry(selector, 10, 300)
              .catch(() => document.querySelector(selector));
              
            if (element) {
              console.log(`[Tutorial] Found element for step ${tutorialStep}: ${selector}`);
              
              // If there's an event to listen for
              if (event) {
                const handleEvent = () => {
                  console.log(`[Tutorial] Event '${event}' triggered for step ${tutorialStep}`);
                  if (condition) {
                    if (condition()) {
                      console.log(`[Tutorial] Condition met for step ${tutorialStep}, advancing`);
                      setTimeout(() => handleStepChange(tutorialStep + 1), delay);
                    }
                  } else {
                    console.log(`[Tutorial] Advancing from step ${tutorialStep}`);
                    setTimeout(() => handleStepChange(tutorialStep + 1), delay);
                  }
                };
                
                element.addEventListener(event, handleEvent);
                cleanupFunctions.push(() => element.removeEventListener(event, handleEvent));
              }
              // If there's a condition but no event (check condition immediately and periodically)
              else if (condition) {
                const checkCondition = () => {
                  if (condition()) {
                    console.log(`[Tutorial] Condition met for step ${tutorialStep}, advancing`);
                    setTimeout(() => handleStepChange(tutorialStep + 1), delay);
                    return true;
                  }
                  return false;
                };
                
                if (!checkCondition()) {
                  const intervalId = setInterval(() => {
                    if (checkCondition()) {
                      clearInterval(intervalId);
                    }
                  }, checkInterval);
                  
                  cleanupFunctions.push(() => clearInterval(intervalId));
                }
              }
              else {
                console.log(`[Tutorial] Element found for step ${tutorialStep}, advancing`);
                setTimeout(() => handleStepChange(tutorialStep + 1), delay);
              }
            } else {
              console.log(`[Tutorial] Setting up observer for step ${tutorialStep}: ${selector}`);
              const observer = new MutationObserver((mutations) => {
                if (document.querySelector(selector)) {
                  console.log(`[Tutorial] Observer found element for step ${tutorialStep}`);
                  observer.disconnect();
                  setupAutoAdvance();
                }
              });
              
              observer.observe(document.body, { 
                childList: true, 
                subtree: true,
                attributes: true,
                characterData: true
              });
              
              observerRef.current = observer;
              cleanupFunctions.push(() => observer.disconnect());
            }
          } catch (error) {
            console.error(`[Tutorial] Error in auto-advancement for step ${tutorialStep}:`, error);
          }
        };
        
        setupAutoAdvance();
      }
      
      return () => {
        cleanupFunctions.forEach(cleanup => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        });
      };
    }
  }, [showTutorial, tutorialStep, tutorialSteps, projectId]);

  useEffect(() => {
    if (showTutorial) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleTutorialComplete();
        }
        else if ((e.key === 'ArrowRight' || e.key === ' ') && tutorialStep < tutorialSteps.length - 1) {
          handleStepChange(tutorialStep + 1);
        }
        else if (e.key === 'ArrowLeft' && tutorialStep > 0) {
          handleStepChange(tutorialStep - 1);
        }
        else if (e.key === 'Home') {
          handleStepChange(0);
        }
        else if (e.key === 'End') {
          handleStepChange(tutorialSteps.length - 1);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showTutorial, tutorialStep, tutorialSteps.length]);

  return (
    <div className="tutorial-wrapper">
      {children}
      
      {showTutorial && (
        <TutorialSystem
          steps={tutorialSteps}
          currentStep={tutorialStep}
          onNextStep={handleStepChange}
          onPrevStep={(step) => handleStepChange(step)}
          onComplete={handleTutorialComplete}
          ref={tutorialOverlayRef}
        />
      )}
      
      {/* Help button to restart tutorial */}
      {!showTutorial && hasSeenTutorial && (
        <button 
          className="help-button" 
          onClick={handleRestartTutorial} 
          aria-label="Restart Tutorial"
          title="Restart Tutorial"
        >
          ?
        </button>
      )}
    </div>
  );
}

export default TutorialWrapper;