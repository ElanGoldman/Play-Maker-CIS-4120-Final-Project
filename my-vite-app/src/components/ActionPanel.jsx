import { useState, useEffect, useRef } from 'react';
import Action from '../models/Action';
import '../styles/ActionPanels.css';

// SVG Icon Components with smaller size
const MouseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="3" width="12" height="18" rx="6" />
    <line x1="12" y1="7" x2="12" y2="11" />
  </svg>
);

const StartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" fill="#64ffda" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const SpacebarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="16" height="6" rx="2" />
    <line x1="8" y1="12" x2="16" y2="12" strokeWidth="3" />
  </svg>
);

const JumpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c-4.97 0-9-4.5-9-10v-4h6v4c0 2.21 1.79 4 4 4s4-1.79 4-4v-4h6v4c0 5.5-4 10-9 10z" />
    <path d="M9 6V2" />
    <path d="M15 6V2" />
  </svg>
);

const MoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9l-3 3 3 3" />
    <path d="M9 5l3-3 3 3" />
    <path d="M9 19l3 3 3-3" />
    <path d="M19 9l3 3-3 3" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

function ActionPanel({ selectedAsset, onAddAction, onRemoveAction, onSwitchToAssets, onOptionsVisibilityChange }) {
  const [currentView, setCurrentView] = useState('actions'); // 'actions', 'options'
  const [selectedTrigger, setSelectedTrigger] = useState(null);

  // Keep track of previous asset ID to detect actual changes
  const prevAssetIdRef = useRef(selectedAsset?.canvasId);
  
  // Reset the view only when the selected asset actually changes
  useEffect(() => {
    // Only reset if we're getting a new asset with a different ID
    if (selectedAsset && selectedAsset.canvasId !== prevAssetIdRef.current) {
      console.log('Asset changed from', prevAssetIdRef.current, 'to', selectedAsset.canvasId);
      setCurrentView('actions');
      setSelectedTrigger(null);
      
      // Notify parent component that options panel is not visible
      if (typeof onOptionsVisibilityChange === 'function') {
        onOptionsVisibilityChange(false);
      }
      
      prevAssetIdRef.current = selectedAsset.canvasId;
    }
  }, [selectedAsset, onOptionsVisibilityChange]);

  // Available action types/triggers with icons
  const actionTriggers = [
    { 
      id: 'mouseDown', 
      name: 'Mouse Down',
      icon: <MouseIcon />
    },
    { 
      id: 'onStart', 
      name: 'On Start',
      icon: <StartIcon />
    },
    { 
      id: 'keyPress', 
      name: 'Press Up Arrow',
      icon: <ArrowUpIcon />
    },
    { 
      id: 'spacePress', 
      name: 'Press Space',
      icon: <SpacebarIcon />
    }
  ];

  // Available behaviors for each action type
  const actionBehaviors = {
    mouseDown: [
      { id: 'jump', name: 'Jump', params: { height: 100 }, icon: <JumpIcon /> },
      { id: 'changeSize', name: 'Change Size', params: { scale: 1.5 }, icon: <MoveIcon /> },
      { id: 'setVector', name: 'Vector', params: { x: 0, y: -5 }, icon: <ArrowUpIcon /> }
    ],
    onStart: [
      { id: 'move', name: 'Move', params: { x: 10, y: 0 }, icon: <MoveIcon /> },
      { id: 'playSound', name: 'Play Sound', params: { sound: 'pop' }, icon: <StartIcon /> },
      { id: 'setPosition', name: 'Set Position', params: { x: 400, y: 300 }, icon: <MoveIcon /> }
    ],
    keyPress: [
      { id: 'moveUp', name: 'Move Up', params: { distance: 10 }, icon: <ArrowUpIcon /> },
      { id: 'moveDown', name: 'Move Down', params: { distance: 10 }, icon: <ArrowUpIcon /> },
      { id: 'moveLeft', name: 'Move Left', params: { distance: 10 }, icon: <MoveIcon /> },
      { id: 'moveRight', name: 'Move Right', params: { distance: 10 }, icon: <MoveIcon /> }
    ],
    spacePress: [
      { id: 'jump', name: 'Jump', params: { height: 50, duration: 1000 }, icon: <JumpIcon /> }
    ]
  };

  // Handle action trigger selection
  const handleTriggerSelect = (trigger) => {
    console.log('Trigger selected:', trigger.name);
    setSelectedTrigger(trigger);
    setCurrentView('options');
    
    // Notify parent component that options panel is visible
    if (typeof onOptionsVisibilityChange === 'function') {
      onOptionsVisibilityChange(true);
      console.log('Options visibility set to true');
    } else {
      console.warn('onOptionsVisibilityChange function not provided');
    }
    
    setTimeout(() => {
      console.log('Current view after timeout:', currentView);
    }, 500);
  };

  // Handle behavior selection
  const handleBehaviorSelect = (behavior) => {
    if (!selectedAsset || !selectedTrigger) return;

    // Create action object
    const newAction = new Action({
      type: selectedTrigger.id,
      behavior: behavior.id,
      parameters: behavior.params || {}
    });

    console.log('New action created:', newAction);

    // Pass to parent component to update the asset
    onAddAction(newAction);

    // Reset view to actions list
    setCurrentView('actions');
    setSelectedTrigger(null);
    
    if (typeof onOptionsVisibilityChange === 'function') {
      onOptionsVisibilityChange(false);
    }
  };

  // Handle back button click to go to assets panel
  const handleBackToAssets = () => {
    if (typeof onSwitchToAssets === 'function') {
      onSwitchToAssets();
    }
  };

  const handleBackToActions = () => {
    setCurrentView('actions');
    setSelectedTrigger(null);
    
    // Notify parent component that options panel is no longer visible
    if (typeof onOptionsVisibilityChange === 'function') {
      onOptionsVisibilityChange(false);
    }
  };

  const getTriggerById = (triggerId) => {
    return actionTriggers.find(t => t.id === triggerId);
  };
  
  const getBehaviorById = (triggerId, behaviorId) => {
    const behaviors = actionBehaviors[triggerId];
    if (!behaviors) return null;
    return behaviors.find(b => b.id === behaviorId);
  };

  // Show the list of action triggers
  const renderActionTriggers = () => (
    <>
      <div className="action-panel-header">
        <button 
          className="back-arrow-button" 
          onClick={handleBackToAssets}
          aria-label="Back to Assets Panel"
        >
          ←
        </button>
        <h2>Actions</h2>
      </div>
  
      <div className="action-triggers-grid">
        {actionTriggers.map(trigger => (
          <button
            key={trigger.id}
            className="action-trigger-button"
            onClick={() => handleTriggerSelect(trigger)}
          >
            <div className="action-icon">{trigger.icon}</div>
            <span className="action-name">{trigger.name}</span>
          </button>
        ))}
      </div>
  
      {/* Show current actions on selected asset */}
      {selectedAsset && (
        <div className="selected-asset-actions">
          <div className="selected-asset-preview">
            <img
              src={selectedAsset.imgSrc}
              alt={selectedAsset.name}
              style={{
                imageRendering: 'pixelated',
                width: '24px',
                height: '24px'
              }}
            />
          </div>
  
          {/* Show different header based on whether there are actions */}
          {(!selectedAsset.actions || selectedAsset.actions.length === 0) ? (
            <h3>NO ACTIONS YET</h3>
          ) : (
            <h3>CURRENT ACTIONS:</h3>
          )}
          
          {/* Check if there are actions */}
          {(!selectedAsset.actions || selectedAsset.actions.length === 0) ? (
            <div className="no-actions-message"></div>
          ) : (
            <div className="action-list">
              {selectedAsset.actions.map(action => {
                const trigger = getTriggerById(action.type);
                const behavior = getBehaviorById(action.type, action.behavior);
  
                return (
                  <div key={action.id} className="action-item">
                    <div className="action-labels">
                      <span className="action-trigger-label">
                        <span className="action-icon-small">
                          {trigger?.icon || <StartIcon />}
                        </span>
                        {trigger?.name || action.type}
                      </span>
                      <span className="action-behavior-label">
                        <span className="action-icon-small">
                          {behavior?.icon || <StartIcon />}
                        </span>
                        {behavior?.name || action.behavior}
                      </span>
                    </div>
                    <button
                      className="remove-action-button"
                      onClick={() => onRemoveAction(action.id)}
                      aria-label={`Remove action ${trigger?.name || action.type} - ${behavior?.name || action.behavior}`}
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );

  // Show the behaviors for the selected trigger
  const renderBehaviorOptions = () => {
    if (!selectedTrigger) return null;

    const availableBehaviors = actionBehaviors[selectedTrigger.id] || []; // Handle case where trigger might not have behaviors

    return (
      <>
        <div className="action-panel-header">
          <button 
            className="back-arrow-button" 
            onClick={handleBackToActions}
            aria-label="Back to Actions List"
          >
            ←
          </button>
          <h2>{selectedTrigger.name} Options</h2>
        </div>

        <div className="action-behaviors-grid">
          {availableBehaviors.length > 0 ? (
            availableBehaviors.map(behavior => (
              <button
                key={behavior.id}
                className="action-behavior-button"
                onClick={() => handleBehaviorSelect(behavior)}
              >
                <div className="action-icon">{behavior.icon}</div>
                <span className="action-name">{behavior.name}</span>
              </button>
            ))
          ) : (
            <p>No behaviors defined for this trigger.</p>
          )}
        </div>

        <div className="selected-asset-preview">
          {selectedAsset && <img
            src={selectedAsset.imgSrc}
            alt={selectedAsset.name}
            style={{
              imageRendering: 'pixelated',
              width: '24px',
              height: '24px'
            }}
          /> }
          <div className="selected-trigger-label">
            <span className="action-icon-small">{selectedTrigger.icon}</span>
            {selectedTrigger.name}
          </div>
        </div>
      </>
    );
  };

  console.log('Rendering ActionPanel', { 
    currentView, 
    selectedTrigger: selectedTrigger?.name,
    showOptionsPanel: currentView === 'options' && selectedTrigger 
  });
  
  return (
    <div className="action-panels-container">
      <div className={`action-panel ${currentView === 'options' ? 'with-options' : ''}`}>
        {selectedAsset ? renderActionTriggers() : (
          <>
            <div className="action-panel-header">
              <button 
                className="back-arrow-button" 
                onClick={handleBackToAssets}
                aria-label="Back to Assets Panel"
              >
                ←
              </button>
              <h2>Actions</h2>
            </div>
            
            <div className="no-selection">
              <p>Click on an asset in the canvas to add actions</p>
            </div>
          </>
        )}
      </div>
      
      {currentView === 'options' && (
        <div className="options-panel" key="options-panel">
          {renderBehaviorOptions()}
        </div>
      )}
    </div>
  );
}

export default ActionPanel;