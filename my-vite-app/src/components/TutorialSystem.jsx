import { useState, useEffect, useRef, forwardRef } from 'react';

const TutorialSystem = forwardRef(({ 
  steps, 
  currentStep, 
  onNextStep, 
  onPrevStep,
  onComplete 
}, ref) => {
  const [isVisible, setIsVisible] = useState(true);
  const [highlightStyles, setHighlightStyles] = useState({});
  const [popupStyles, setPopupStyles] = useState({});
  const targetRef = useRef(null);
  const overlayRef = useRef(null);
  const popupRef = useRef(null);
  const highlightRef = useRef(null);
  
  useEffect(() => {
    const step = steps[currentStep];
    if (!step) return;
    
    setHighlightStyles({});
    setPopupStyles({});

    if (step.selector) {
      const targetElement = document.querySelector(step.selector);
      if (targetElement) {
        targetRef.current = targetElement;
        
        const rect = targetElement.getBoundingClientRect();
        const padding = 8; 
        
        const highlightStyle = {
          top: `${rect.top - padding}px`,
          left: `${rect.left - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          borderRadius: '4px',
        };
        
        setHighlightStyles(highlightStyle);
        
        let popupTop, popupLeft;
        
        const popupWidth = popupRef.current?.offsetWidth || 380;
        const popupHeight = popupRef.current?.offsetHeight || 250;

        if (step.position) {
          popupTop = step.position.top;
          popupLeft = step.position.left;
        } else {
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          
          // Try to position to the right of the element
          if (rect.right + 20 + popupWidth < windowWidth) {
            popupLeft = `${rect.right + 20}px`;
            popupTop = `${rect.top}px`;
          } 
          // Try to position below the element
          else if (rect.bottom + 20 + popupHeight < windowHeight) {
            popupLeft = `${rect.left}px`;
            popupTop = `${rect.bottom + 20}px`;
          }
          // Try to position to the left of the element
          else if (rect.left - 20 - popupWidth > 0) {
            popupLeft = `${rect.left - popupWidth - 20}px`;
            popupTop = `${rect.top}px`;
          }
          // Position above the element
          else if (rect.top - 20 - popupHeight > 0) {
            popupLeft = `${rect.left}px`;
            popupTop = `${rect.top - popupHeight - 20}px`;
          }
          else {
             popupLeft = '50%';
             popupTop = '50%';
          }
        }
        
        setPopupStyles({
          position: 'absolute',
          top: popupTop,
          left: popupLeft,
          transform: (popupLeft === '50%' && popupTop === '50%') || step.position ? 'translate(-50%, -50%)' : 'none',
        });
        
        if (!isElementInViewport(targetElement)) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      } else {
          console.warn(`[Tutorial] Element not found for selector: ${step.selector}`);
          setPopupStyles({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          });
      }
    } else {
      setPopupStyles({
        position: 'absolute',
        top: step.position?.top || '50%',
        left: step.position?.left || '50%',
        transform: 'translate(-50%, -50%)',
      });
    }
    
    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
         return;
      }
      
      if (e.key === 'Escape') {
        onComplete();
      } else if ((e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') && currentStep < steps.length -1) {
        if(e.key === ' ') e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        handlePrevious();
      } else if (e.key === 'Home') {
        jumpToStep(0);
      } else if (e.key === 'End' && steps.length > 0) {
        jumpToStep(steps.length - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, steps, onComplete]);

  // Check if element is in viewport
  const isElementInViewport = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onNextStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      if (typeof onPrevStep === 'function') {
        onPrevStep(currentStep - 1);
      } else {
        onNextStep(currentStep - 1); 
      }
    }
  };

  const handleSkip = () => {
    onComplete();
  };
  
  // Jump to a specific step
  const jumpToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
       if (typeof onPrevStep === 'function' && stepIndex < currentStep) {
         onPrevStep(stepIndex);
       } else {
         onNextStep(stepIndex);
       }
    }
  };

  if (!isVisible || !steps[currentStep]) return null;

  const overlayClassName = `tutorial-overlay ${currentStep === 0 ? 'tutorial-overlay-step1' : ''}`;

  return (
    <div 
      className={overlayClassName} 
      ref={node => {
        overlayRef.current = node;
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
    >
      {}
      <div 
        className="tutorial-popup"
        style={popupStyles}
        ref={popupRef}
      >
        <div className="tutorial-header">
          <h3>{steps[currentStep].title}</h3>
          <div className="tutorial-header-buttons">
            <button 
              onClick={() => jumpToStep(0)} 
              className="tutorial-restart-button" 
              aria-label="Restart Tutorial"
              title="Restart Tutorial"
              disabled={currentStep === 0}
            >
              ↺
            </button>
            <button 
              onClick={handleSkip} 
              className="tutorial-skip-button" 
              aria-label="Skip Tutorial"
              title="Skip Tutorial"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="tutorial-content">
          <p>{steps[currentStep].content}</p>
          
          {steps[currentStep].additionalContent && (
            <div className="tutorial-additional-content">
              {steps[currentStep].additionalContent.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
          
        </div>
        <div className="tutorial-footer">
          <div className="tutorial-navigation">
            <button 
              onClick={handlePrevious} 
              className="tutorial-nav-button tutorial-prev-button"
              disabled={currentStep === 0}
              aria-label="Previous Step"
              title="Previous Step"
            >
              ←
            </button>
            <span className="tutorial-progress">{`${currentStep + 1}/${steps.length}`}</span>
            <button 
              onClick={handleNext} 
              className="tutorial-nav-button tutorial-next-button"
              aria-label={currentStep < steps.length - 1 ? 'Next Step' : 'Finish Tutorial'}
              title={currentStep < steps.length - 1 ? 'Next Step' : 'Finish Tutorial'}
            >
              {currentStep < steps.length - 1 ? '→' : '✓'}
            </button>
          </div>
          
          {}
          <div className="tutorial-steps-indicator">
            {steps.map((step, index) => (
              <button
                key={index}
                className={`tutorial-step-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => jumpToStep(index)}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                title={step.title}
              />
            ))}
          </div>
        </div>
      </div>
      
      {}
      {steps[currentStep].selector && highlightStyles.width && (
        <div 
          className="tutorial-highlight"
          style={highlightStyles} 
          ref={highlightRef}
        />
      )}
    </div>
  );
});

export default TutorialSystem;