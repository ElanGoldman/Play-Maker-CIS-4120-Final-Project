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
      // Ensure saved step is valid for current tutorial steps
      if (savedState.currentStep >= 0 && savedState.currentStep < tutorialSteps.length) {
          setTutorialStep(savedState.currentStep);
      } else {
          console.warn(`[Tutorial] Saved step ${savedState.currentStep} out of bounds. Resetting to 0.`);
          setTutorialStep(0);
      }
    } else {
        setTutorialStep(0);
    }
  }, [projectId, tutorialSteps.length]);

  useEffect(() => {
    if (showTutorial) {
      saveTutorialState(projectId, {
        currentStep: tutorialStep,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [tutorialStep, showTutorial, projectId]);

  const handleStepChange = (newStep) => {
     if (newStep >= 0 && newStep < tutorialSteps.length) {
        console.log(`[Tutorial] Attempting step change from ${tutorialStep} to ${newStep}`);
        recordStepTransition(projectId, tutorialStep, newStep);
        setTutorialStep(newStep);
     } else if (newStep >= tutorialSteps.length) {
         handleTutorialComplete();
     } else {
         console.warn(`[Tutorial] Invalid step change requested: ${newStep}`);
     }
  };

  const handleTutorialComplete = () => {
    console.log('[Tutorial] Completing tutorial');
    if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
        console.log('[Tutorial] Observer disconnected on complete.');
    }
    setShowTutorial(false);
    setHasSeenTutorial(true);
    recordTutorialCompletion(projectId);
    completeTutorial(projectId);
  };

  const handleRestartTutorial = () => {
    console.log('[Tutorial] Restarting tutorial');
    if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
        console.log('[Tutorial] Observer disconnected on restart.');
    }
    recordTutorialRestart(projectId);
    resetTutorial(projectId);
    setTutorialStep(0);
    setShowTutorial(true);
    setHasSeenTutorial(false);
  };

  // Effect for Auto-Advancement Logic
  useEffect(() => {
    if (!showTutorial || !tutorialSteps[tutorialStep]) {
      return;
    }

    const currentStepConfig = tutorialSteps[tutorialStep];
    let cleanupFunctions = [];

    if (observerRef.current) {
      console.log(`[Tutorial] Disconnecting previous observer before setting up step ${tutorialStep}`);
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (currentStepConfig.autoAdvance) {
      const {
        selector,
        event,
        condition,
        delay = 500,
        checkInterval = 1000
      } = currentStepConfig.autoAdvance;

      console.log(`[Tutorial] Setting up auto-advance for step ${tutorialStep}`, currentStepConfig.autoAdvance);

      if (selector === 'window') {
        if (event) {
          const handleEvent = (e) => {
             if (event.startsWith('playmaker:') || e.type === event) {
                console.log(`[Tutorial] Event '${event}' detected on window for step ${tutorialStep}`);
                if (condition && !condition()) {
                    console.log(`[Tutorial] Event on window detected, but condition not met.`);
                    return;
                }
                console.log(`[Tutorial] Advancing from step ${tutorialStep} due to window event.`);
                setTimeout(() => handleStepChange(tutorialStep + 1), delay);
             }
          };
          console.log(`[Tutorial] Adding event listener '${event}' to window.`);
          window.addEventListener(event, handleEvent);
          cleanupFunctions.push(() => {
            console.log(`[Tutorial] Removing event listener '${event}' from window.`);
            window.removeEventListener(event, handleEvent);
          });
        } else {
            console.warn(`[Tutorial] 'window' selector used without an event for step ${tutorialStep}. Cannot auto-advance.`);
        }
      }
      else if (condition && !selector && !event) {
          const checkCondition = () => {
            if (condition()) {
              console.log(`[Tutorial] Condition met for step ${tutorialStep}, advancing.`);
              setTimeout(() => handleStepChange(tutorialStep + 1), delay);
              return true;
            }
            return false;
          };
          if (!checkCondition()) {
            console.log(`[Tutorial] Condition not met immediately, setting up interval check.`);
            const intervalId = setInterval(() => {
              if (checkCondition()) {
                clearInterval(intervalId);
                console.log(`[Tutorial] Condition met via interval check.`);
              }
            }, checkInterval);
            cleanupFunctions.push(() => {
                console.log(`[Tutorial] Clearing condition check interval.`);
                clearInterval(intervalId);
            });
          }
      }
      else if (selector) {
        const setupForElement = async () => {
          try {
            const element = await findElementWithRetry(selector, 5, 300)
              .catch(() => document.querySelector(selector));

            if (element) {
              console.log(`[Tutorial] Target element found for step ${tutorialStep}:`, element);
              if (event) {
                const handleEvent = (e) => {
                    if (event.startsWith('playmaker:') || e.type === event) {
                        console.log(`[Tutorial] Event '${event}' triggered on element ${selector} for step ${tutorialStep}`);
                        if (condition && !condition()) {
                            console.log(`[Tutorial] Event on element triggered but condition not met.`);
                            return;
                        }
                        console.log(`[Tutorial] Advancing from step ${tutorialStep} due to element event.`);
                        setTimeout(() => handleStepChange(tutorialStep + 1), delay);
                    }
                };
                console.log(`[Tutorial] Adding event listener '${event}' to element ${selector}`);
                element.addEventListener(event, handleEvent);
                cleanupFunctions.push(() => {
                  console.log(`[Tutorial] Removing event listener '${event}' from element ${selector}`);
                  const currentElement = document.querySelector(selector);
                  if (currentElement) {
                      currentElement.removeEventListener(event, handleEvent);
                  } else if (element && typeof element.removeEventListener === 'function') {
                      try { element.removeEventListener(event, handleEvent); } catch (e) {}
                  }
                });
              } else if (condition) {
                const checkCondition = () => {
                  if (condition()) {
                    console.log(`[Tutorial] Condition met for element ${selector}, advancing.`);
                    setTimeout(() => handleStepChange(tutorialStep + 1), delay);
                    return true;
                  }
                  return false;
                };
                if (!checkCondition()) {
                  console.log(`[Tutorial] Element ${selector} condition not met immediately, setting interval.`);
                  const intervalId = setInterval(() => {
                    if (checkCondition()) {
                      clearInterval(intervalId);
                      console.log(`[Tutorial] Element ${selector} condition met via interval.`);
                    }
                  }, checkInterval);
                  cleanupFunctions.push(() => {
                      console.log(`[Tutorial] Clearing element ${selector} condition interval.`);
                      clearInterval(intervalId);
                  });
                }
              } else {
                console.log(`[Tutorial] Element ${selector} found (selector only), advancing.`);
                setTimeout(() => handleStepChange(tutorialStep + 1), delay);
              }
            } else {
              console.log(`[Tutorial] Element ${selector} not found. Setting up MutationObserver for step ${tutorialStep}.`);
              if (observerRef.current) {
                   console.log("[Tutorial] Disconnecting existing observer before creating new one.")
                   observerRef.current.disconnect();
              }
              const observer = new MutationObserver((mutations) => {
                if (document.querySelector(selector)) {
                  console.log(`[Tutorial] Observer found element ${selector} for step ${tutorialStep}. Re-running setup.`);
                  observer.disconnect();
                  observerRef.current = null;
                  setupForElement();
                }
              });
              observer.observe(document.body, { childList: true, subtree: true });
              observerRef.current = observer;
               cleanupFunctions.push(() => {
                  if (observerRef.current === observer) {
                      console.log(`[Tutorial] Disconnecting MutationObserver for ${selector} via cleanup.`);
                      observerRef.current.disconnect();
                      observerRef.current = null;
                  }
              });
            }
          } catch (error) {
            console.error(`[Tutorial] Error during element setup for step ${tutorialStep}:`, error);
          }
        };
        setupForElement();
      }
    }

    return () => {
        if (cleanupFunctions.length > 0) {
            console.log(`[Tutorial] Running ${cleanupFunctions.length} cleanup functions for step ${tutorialStep}`);
            cleanupFunctions.forEach((cleanup, index) => {
                try {
                    if (typeof cleanup === 'function') {
                        cleanup();
                    }
                } catch (error) {
                    console.error("[Tutorial] Error during cleanup execution:", error);
                }
            });
        }
        if (observerRef.current) {
            console.warn(`[Tutorial] Observer found during final cleanup check for step ${tutorialStep}. Disconnecting.`);
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    };
  }, [showTutorial, tutorialStep, tutorialSteps, projectId]);

  useEffect(() => {
    if (!showTutorial) return;

    const handleKeyDown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        if (e.key === 'Escape') {
            handleTutorialComplete();
        } else if ((e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') && tutorialStep < tutorialSteps.length - 1) {
            if (e.key === ' ') e.preventDefault();
            handleStepChange(tutorialStep + 1);
        } else if (e.key === 'ArrowLeft' && tutorialStep > 0) {
            handleStepChange(tutorialStep - 1);
        } else if (e.key === 'Home') {
            handleStepChange(0);
        } else if (e.key === 'End' && tutorialSteps.length > 0) {
            handleStepChange(tutorialSteps.length - 1);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTutorial, tutorialStep, tutorialSteps.length]);

  return (
    <div className="tutorial-wrapper">
      {children}
      {showTutorial && tutorialSteps.length > 0 && (
        <TutorialSystem
          steps={tutorialSteps}
          currentStep={tutorialStep}
          onNextStep={handleStepChange}
          onPrevStep={handleStepChange}
          onComplete={handleTutorialComplete}
          ref={tutorialOverlayRef}
        />
      )}
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