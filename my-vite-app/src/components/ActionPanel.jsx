import { useState, useEffect } from 'react';
import Action from '../models/Action';

function ActionPanel({ selectedAsset, onAddAction }) {
  const [currentView, setCurrentView] = useState('actions'); // 'actions', 'options'
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  
  // Reset the view when selected asset changes
  useEffect(() => {
    setCurrentView('actions');
    setSelectedTrigger(null);
  }, [selectedAsset]);
  
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
    setSelectedTrigger(trigger);
    setCurrentView('options');
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
  };
  
  // Show the list of action triggers
  const renderActionTriggers = () => (
    <>
      <h2>Actions</h2>
      
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
          
          <div className="action-list">
            {selectedAsset.actions.map(action => {
              const trigger = actionTriggers.find(t => t.id === action.type);
              const behavior = actionBehaviors[action.type]?.find(b => b.id === action.behavior);
              
              return (
                <div key={action.id} className="action-item">
                  <div className="action-trigger-label">{trigger?.name}</div>
                  <div className="action-behavior-label">{behavior?.name}</div>
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
    
    return (
      <>
        <h2>{selectedTrigger.name} Options</h2>
        
        {actionBehaviors[selectedTrigger.id].map(behavior => (
          <button
            key={behavior.id}
            className="action-behavior-button"
            onClick={() => handleBehaviorSelect(behavior)}
          >
            {behavior.name}
          </button>
        ))}
        
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
          <div className="selected-trigger-label">{selectedTrigger.name}</div>
        </div>
      </>
    );
  };
  
  return (
    <div className="action-panel">
      {selectedAsset ? (
        currentView === 'actions' ? renderActionTriggers() : renderBehaviorOptions()
      ) : (
        <div className="no-selection">
          <p>Click on an asset in the canvas to add actions</p>
        </div>
      )}
    </div>
  );
}

export default ActionPanel;