import { useState, useEffect, useRef } from 'react';
import Action from '../models/Action';

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

  // Available action types/triggers
  const actionTriggers = [
    { id: 'mouseDown', name: 'Mouse Down' },
    { id: 'onStart', name: 'On Start' },
    { id: 'keyPress', name: 'Press Up Arrow' },
    { id: 'spacePress', name: 'Press Space' }
  ];

  // Available behaviors for each action type
  const actionBehaviors = {
    mouseDown: [
      { id: 'jump', name: 'Jump', params: { height: 100 } },
      { id: 'changeSize', name: 'Change Size', params: { scale: 1.5 } },
      { id: 'setVector', name: 'Vector', params: { x: 0, y: -5 } }
    ],
    onStart: [
      { id: 'move', name: 'Move', params: { x: 10, y: 0 } },
      { id: 'playSound', name: 'Play Sound', params: { sound: 'pop' } },
      { id: 'setPosition', name: 'Set Position', params: { x: 400, y: 300 } }
    ],
    keyPress: [
      { id: 'moveUp', name: 'Move Up', params: { distance: 10 } },
      { id: 'moveDown', name: 'Move Down', params: { distance: 10 } },
      { id: 'moveLeft', name: 'Move Left', params: { distance: 10 } },
      { id: 'moveRight', name: 'Move Right', params: { distance: 10 } }
    ],
    spacePress: [
      { id: 'jump', name: 'Jump', params: { height: 50, duration: 1000 } }
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

      {actionTriggers.map(trigger => (
        <button
          key={trigger.id}
          className="action-trigger-button"
          onClick={() => handleTriggerSelect(trigger)}
        >
          {trigger.name}
        </button>
      ))}

      {/* Show current actions on selected asset */}
      {selectedAsset && selectedAsset.actions && selectedAsset.actions.length > 0 && (
        <div className="selected-asset-actions">
          <div className="selected-asset-preview">
            <img
              src={selectedAsset.imgSrc}
              alt={selectedAsset.name}
              style={{
                imageRendering: 'pixelated',
                width: '32px',
                height: '32px'
              }}
            />
          </div>

          {/* Added header for clarity */}
          <h3>Current Actions:</h3>
          <div className="action-list">
            {selectedAsset.actions.map(action => {
              const trigger = actionTriggers.find(t => t.id === action.type);
              const behavior = actionBehaviors[action.type]?.find(b => b.id === action.behavior);

              return (
                <div key={action.id} className="action-item">
                  <div className="action-labels">
                    <span className="action-trigger-label">{trigger?.name || action.type}</span>
                    <span className="action-behavior-label">{behavior?.name || action.behavior}</span>
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

        {availableBehaviors.length > 0 ? ( // Check if behaviors exist
          availableBehaviors.map(behavior => (
            <button
              key={behavior.id}
              className="action-behavior-button"
              onClick={() => handleBehaviorSelect(behavior)}
            >
              {behavior.name}
            </button>
          ))
        ) : (
          <p>No behaviors defined for this trigger.</p> // Display message if no behaviors
        )}

        <div className="selected-asset-preview">
          {/* Added check for selectedAsset before accessing imgSrc */}
          {selectedAsset && <img
            src={selectedAsset.imgSrc}
            alt={selectedAsset.name}
            style={{
              imageRendering: 'pixelated',
              width: '32px',
              height: '32px'
            }}
          /> }
          <div className="selected-trigger-label">{selectedTrigger.name}</div>
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