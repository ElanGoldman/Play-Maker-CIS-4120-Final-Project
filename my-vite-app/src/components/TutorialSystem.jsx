import { useState, useEffect, useRef, forwardRef } from 'react';

/**
 * Enhanced TutorialSystem component with interactive transparency toggle
 */
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
  const [moreTransparent, setMoreTransparent] = useState(false);
  const targetRef = useRef(null);
  const overlayRef = useRef(null);
  const popupRef = useRef(null);
  const highlightRef = useRef(null);
  
  // Toggle between regular and high transparency modes
  const toggleTransparency = () => {
    setMoreTransparent(prevState => !prevState);
  };
  
  // Effect to apply the transparency class based on state change
  useEffect(() => {
    if (overlayRef.current) {
      if (moreTransparent) {
        overlayRef.current.classList.add('fully-transparent');
      } else {
        overlayRef.current.classList.remove('fully-transparent');
      }
    }
  }, [moreTransparent]);
  
  // Focus on the highlighted element and calculate positions
  useEffect(() => {
    const step = steps[currentStep];
    if (!step) return;
    
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
        
        // Calculate popup position to avoid the highlight
        let popupTop, popupLeft;
        
        // Position popup based on the step's position preference or calculate optimal position
        if (step.position) {
          popupTop = step.position.top;
          popupLeft = step.position.left;
        } else {
          // Calculate best position for popup
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          
          // Try to position to the right of the element
          if (rect.right + 360 < windowWidth) {
            popupLeft = `${rect.right + 20}px`;
            popupTop = `${rect.top}px`;
          } 
          // Try to position below the element
          else if (rect.bottom + 250 < windowHeight) {
            popupLeft = `${rect.left}px`;
            popupTop = `${rect.bottom + 20}px`;
          }
          // Try to position to the left of the element
          else if (rect.left - 360 > 0) {
            popupLeft = `${rect.left - 360 - 20}px`;
            popupTop = `${rect.top}px`;
          }
          // Position above the element
          else {
            popupLeft = `${rect.left}px`;
            popupTop = `${rect.top - 250 - 20}px`;
          }
        }
        
        setPopupStyles({
          position: 'absolute',
          top: popupTop,
          left: popupLeft,
          transform: step.position ? 'translate(-50%, -50%)' : 'none',
        });
        
        if (!isElementInViewport(targetElement)) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    } else {
      setHighlightStyles({});
      setPopupStyles({
        position: 'absolute',
        top: step.position?.top || '50%',
        left: step.position?.left || '50%',
        transform: 'translate(-50%, -50%)',
      });
    }
    
    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onComplete();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Home') {
        jumpToStep(0);
      } else if (e.key === 'End') {
        jumpToStep(steps.length - 1);
      } else if (e.key === 'T') {
        toggleTransparency();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, steps, onComplete, moreTransparent]);

  // Check if element is in viewport
  const isElementInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
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

  return (
    <div 
      className={`tutorial-overlay ${moreTransparent ? 'fully-transparent' : ''}`} 
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
      <div 
        className="tutorial-popup"
        style={popupStyles}
        ref={popupRef}
      >
        <div className="tutorial-header">
          <h3>{steps[currentStep].title}</h3>
          <div className="tutorial-header-buttons">
            <button 
              onClick={toggleTransparency} 
              className="tutorial-transparency-toggle" 
              aria-label={moreTransparent ? "Decrease Transparency" : "Increase Transparency"}
              title={moreTransparent ? "Decrease Transparency" : "Increase Transparency"}
            >
              {moreTransparent ? "👁️" : "👓"}
            </button>
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
          
          {/* Step indicator dots */}
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
      
      {steps[currentStep].selector && (
        <div 
          className={`tutorial-highlight ${moreTransparent ? 'highlight-transparent' : ''}`}
          style={highlightStyles} 
          ref={highlightRef}
        />
      )}
    </div>
  );
});

export default TutorialSystem;