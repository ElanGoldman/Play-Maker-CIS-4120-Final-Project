// Store tutorial state in localStorage
export const saveTutorialState = (projectId, state) => {
    try {
      localStorage.setItem(`tutorial_state_${projectId}`, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Error saving tutorial state:', error);
      return false;
    }
  };
  
  export const loadTutorialState = (projectId) => {
    try {
      const stateStr = localStorage.getItem(`tutorial_state_${projectId}`);
      if (!stateStr) return null;
      return JSON.parse(stateStr);
    } catch (error) {
      console.error('Error loading tutorial state:', error);
      return null;
    }
  };
  
  // Mark tutorial as completed
  export const completeTutorial = (projectId) => {
    try {
      localStorage.setItem(`tutorial_completed_${projectId}`, 'true');
      return true;
    } catch (error) {
      console.error('Error marking tutorial as completed:', error);
      return false;
    }
  };
  
  export const isTutorialCompleted = (projectId) => {
    return localStorage.getItem(`tutorial_completed_${projectId}`) === 'true';
  };
  
  // Reset tutorial progress
  export const resetTutorial = (projectId) => {
    try {
      localStorage.removeItem(`tutorial_state_${projectId}`);
      localStorage.removeItem(`tutorial_completed_${projectId}`);
      return true;
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      return false;
    }
  };
  
  export const findElementWithRetry = (selector, maxAttempts = 10, interval = 300) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkForElement = () => {
        attempts++;
        const element = document.querySelector(selector);
        
        if (element) {
          resolve(element);
        } else if (attempts >= maxAttempts) {
          reject(new Error(`Element with selector "${selector}" not found after ${maxAttempts} attempts`));
        } else {
          setTimeout(checkForElement, interval);
        }
      };
      
      checkForElement();
    });
  };
  
  export const getTutorialAnalytics = (projectId) => {
    try {
      const tutorialState = loadTutorialState(projectId);
      const completed = isTutorialCompleted(projectId);
      
      const stepsHistoryStr = localStorage.getItem(`tutorial_steps_history_${projectId}`);
      const stepsHistory = stepsHistoryStr ? JSON.parse(stepsHistoryStr) : [];
      
      return {
        completed,
        currentState: tutorialState,
        stepsHistory,
        completionTimestamp: localStorage.getItem(`tutorial_completion_time_${projectId}`),
        timesRestarted: parseInt(localStorage.getItem(`tutorial_restart_count_${projectId}`) || '0')
      };
    } catch (error) {
      console.error('Error getting tutorial analytics:', error);
      return null;
    }
  };
  
  export const recordStepTransition = (projectId, fromStep, toStep) => {
    try {
      const stepsHistoryStr = localStorage.getItem(`tutorial_steps_history_${projectId}`);
      const stepsHistory = stepsHistoryStr ? JSON.parse(stepsHistoryStr) : [];
      
      stepsHistory.push({
        from: fromStep,
        to: toStep,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem(`tutorial_steps_history_${projectId}`, JSON.stringify(stepsHistory));
      return true;
    } catch (error) {
      console.error('Error recording step transition:', error);
      return false;
    }
  };
  
  export const recordTutorialCompletion = (projectId) => {
    try {
      localStorage.setItem(`tutorial_completion_time_${projectId}`, new Date().toISOString());
      completeTutorial(projectId);
      return true;
    } catch (error) {
      console.error('Error recording tutorial completion:', error);
      return false;
    }
  };
  
  export const recordTutorialRestart = (projectId) => {
    try {
      const restartCount = parseInt(localStorage.getItem(`tutorial_restart_count_${projectId}`) || '0');
      localStorage.setItem(`tutorial_restart_count_${projectId}`, (restartCount + 1).toString());
      return true;
    } catch (error) {
      console.error('Error recording tutorial restart:', error);
      return false;
    }
  };