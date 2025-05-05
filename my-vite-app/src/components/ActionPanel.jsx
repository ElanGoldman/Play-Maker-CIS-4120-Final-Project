import { useState, useEffect, useRef } from 'react';
import Action from '../models/Action';
import '../styles/ActionPanels.css';
import { getIndustryInfo } from '../data/industryMappings';

const MouseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="3" width="12" height="18" rx="6" />
    <line x1="12" y1="7" x2="12" y2="11" />
  </svg>
);

const OnClickIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="3" width="12" height="18" rx="6" />
    <circle cx="12" cy="9" r="2" fill="#64ffda" />
    <line x1="12" y1="14" x2="12" y2="18" />
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
const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 5 5 12 12 19" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 19 19 12 12 5" />
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
const FadeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </svg>
);
const CollisionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const WinCollisionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <polygon points="12,6 14,10 18,11 15,14 16,18 12,16 8,18 9,14 6,11 10,10" fill="#64ffda" stroke="#64ffda" strokeWidth="0.5" />
  </svg>
);

const StaticIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const InfoModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose}>✕</button>
        <h3>{data.title} (in {data.engine})</h3>
        <div className="info-modal-content-inner">
          <p>{data.description}</p>
          {data.codeSnippet && (
            <>
              <p><strong>Example Code:</strong></p>
              <pre className="code-snippet-block"><code>{data.codeSnippet.trim()}</code></pre>
            </>
          )}
          {data.keywords && data.keywords.length > 0 && (
             <p><strong>Keywords:</strong> {data.keywords.join(', ')}</p>
          )}
          {data.link && (
            <p><a href={data.link} target="_blank" rel="noopener noreferrer">Learn More ({data.engine} Docs)</a></p>
          )}
        </div>
      </div>
    </div>
  );
};


function ActionPanel({ selectedAsset, onAddAction, onRemoveAction, onSwitchToAssets, onOptionsVisibilityChange }) {
  const [currentView, setCurrentView] = useState('actions');
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const prevAssetIdRef = useRef(selectedAsset?.canvasId);
  const [infoModalData, setInfoModalData] = useState(null);

  useEffect(() => {
    if (selectedAsset && selectedAsset.canvasId !== prevAssetIdRef.current) {
      setCurrentView('actions');
      setSelectedTrigger(null);
      if (typeof onOptionsVisibilityChange === 'function') {
        onOptionsVisibilityChange(false);
      }
      prevAssetIdRef.current = selectedAsset.canvasId;
    } else if (!selectedAsset) {
        setCurrentView('actions');
        setSelectedTrigger(null);
        if (typeof onOptionsVisibilityChange === 'function') {
          onOptionsVisibilityChange(false);
        }
        prevAssetIdRef.current = null;
    }
  }, [selectedAsset, onOptionsVisibilityChange]);

  const actionTriggers = [
    { id: 'mouseDown', name: 'Mouse Down', icon: <MouseIcon />, description: 'Triggers when any mouse click happens in the canvas' },
    { id: 'onStart', name: 'On Start', icon: <StartIcon />, description: 'Triggers when game starts' },
    { id: 'onClick', name: 'On Click', icon: <OnClickIcon />, description: 'Triggers when this asset is clicked' },
    { id: 'spacePress', name: 'Press Space', icon: <SpacebarIcon />, description: 'Triggers when Spacebar is pressed' },
    { id: 'keyPress', name: 'Arrow Up', icon: <ArrowUpIcon />, description: 'Triggers when Up Arrow key is pressed' },
    { id: 'keyPressDown', name: 'Arrow Down', icon: <ArrowDownIcon />, description: 'Triggers when Down Arrow key is pressed' },
    { id: 'keyPressLeft', name: 'Arrow Left', icon: <ArrowLeftIcon />, description: 'Triggers when Left Arrow key is pressed' },
    { id: 'keyPressRight', name: 'Arrow Right', icon: <ArrowRightIcon />, description: 'Triggers when Right Arrow key is pressed' },
  ];

  const actionBehaviors = {
    onClick: [
      { id: 'jump', name: 'Jump', params: { height: 100 }, icon: <JumpIcon /> },
      { id: 'changeSize', name: 'Change Size', params: { scale: 1.5 }, icon: <MoveIcon /> },
    ],
    mouseDown: [
      { id: 'teleport', name: 'Teleport', params: {}, icon: <MoveIcon /> },
      { id: 'jump', name: 'Jump', params: { height: 100 }, icon: <JumpIcon /> }
    ],
    onStart: [
      { id: 'fadeIn', name: 'Fade In', params: { duration: 1000 }, icon: <FadeIcon /> },
      { id: 'enableCollision', name: 'Enable Collision', params: {}, icon: <CollisionIcon /> },
      { id: 'enableGravity', name: 'Enable Gravity', params: {}, icon: <CollisionIcon /> },
      { id: 'setStatic', name: 'Set Static', params: {}, icon: <StaticIcon /> },
      { id: 'winCollision', name: 'Win Collision', params: {}, icon: <WinCollisionIcon /> }
    ],
    keyPress: [
      { id: 'setVector', name: 'Vector Up', params: { x: 0, y: -5 }, icon: <ArrowUpIcon /> },
      { id: 'jump', name: 'Jump', params: { height: 70, duration: 800 }, icon: <JumpIcon /> },
    ],
    keyPressDown: [
      { id: 'setVector', name: 'Vector Down', params: { x: 0, y: 5 }, icon: <ArrowDownIcon /> }
    ],
    keyPressLeft: [
      { id: 'setVector', name: 'Vector Left', params: { x: -5, y: 0 }, icon: <ArrowLeftIcon /> }
    ],
    keyPressRight: [
      { id: 'setVector', name: 'Vector Right', params: { x: 5, y: 0 }, icon: <ArrowRightIcon /> }
    ],
    spacePress: [
      { id: 'jump', name: 'Jump', params: { height: 50, duration: 1000 }, icon: <JumpIcon /> }
    ]
  };

  const handleTriggerSelect = (trigger) => {
    setSelectedTrigger(trigger);
    setCurrentView('options');
    if (typeof onOptionsVisibilityChange === 'function') {
      onOptionsVisibilityChange(true);
    }
  };

  const handleBehaviorSelect = (behavior) => {
    if (!selectedAsset || !selectedTrigger) return;
    const newAction = new Action({
      type: selectedTrigger.id,
      behavior: behavior.id,
      parameters: behavior.params || {}
    });
    onAddAction(newAction);
    setCurrentView('actions');
    setSelectedTrigger(null);
    if (typeof onOptionsVisibilityChange === 'function') {
      onOptionsVisibilityChange(false);
    }
  };

  const handleBackToAssets = () => {
    if (typeof onSwitchToAssets === 'function') {
      onSwitchToAssets();
    }
  };

  const handleBackToActions = () => {
    setCurrentView('actions');
    setSelectedTrigger(null);
    if (typeof onOptionsVisibilityChange === 'function') {
      onOptionsVisibilityChange(false);
    }
  };

  const getTriggerById = (triggerId) => actionTriggers.find(t => t.id === triggerId);
  const getBehaviorById = (triggerId, behaviorId) => actionBehaviors[triggerId]?.find(b => b.id === behaviorId);

  const handleShowInfo = (action) => {
    const mappingData = getIndustryInfo(action.type, action.behavior);
    if (mappingData) {
      setInfoModalData(mappingData);
    } else {
      setInfoModalData({
         engine: 'Info',
         title: 'No Specific Mapping Found',
         description: `No direct mapping found for '${action.type}' trigger with '${action.behavior}' behavior yet.`,
         keywords: [],
         link: null
      });
      console.warn(`No industry mapping found for: ${action.type}_${action.behavior}`);
    }
  };


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
            title={trigger.description}
          >
            <div className="action-icon">{trigger.icon}</div>
            <span className="action-name">{trigger.name}</span>
          </button>
        ))}
      </div>

      {selectedAsset && (
        <div className="selected-asset-actions">
          <div className="selected-asset-preview">
            <img
              src={selectedAsset.imgSrc}
              alt={selectedAsset.name}
              style={{ imageRendering: 'pixelated', width: '24px', height: '24px' }}
            />
          </div>

          {(!selectedAsset.actions || selectedAsset.actions.length === 0) ? (
            <h3>NO ACTIONS YET</h3>
          ) : (
            <h3>CURRENT ACTIONS:</h3>
          )}

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
                        <span className="action-icon-small">{trigger?.icon || <StartIcon />}</span>
                        {trigger?.name || action.type}
                      </span>
                      <span className="action-behavior-label">
                        <span className="action-icon-small">{behavior?.icon || <StartIcon />}</span>
                        {behavior?.name || action.behavior}
                      </span>
                    </div>
                    <div className="action-item-buttons">
                      <button
                        className="info-button"
                        onClick={() => handleShowInfo(action)}
                        aria-label={`Show info for ${trigger?.name || action.type} - ${behavior?.name || action.behavior}`}
                        title="Learn More"
                      >
                        &#8505;
                      </button>
                      <button
                        className="remove-action-button"
                        onClick={() => onRemoveAction(action.id)}
                        aria-label={`Remove action ${trigger?.name || action.type} - ${behavior?.name || action.behavior}`}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedAsset.isStatic && (
             <div className="collision-status static-status">
               <StaticIcon /> Static Active
             </div>
           )}
          {selectedAsset.hasCollision && !selectedAsset.isWinObject && !selectedAsset.isStatic && (
            <div className="collision-status">
              <CollisionIcon /> Collision Active
            </div>
          )}
          {selectedAsset.isWinObject && (
            <div className="collision-status win-status">
              <WinCollisionIcon /> Win Collision Active
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderBehaviorOptions = () => {
    if (!selectedTrigger) return null;
    const availableBehaviors = actionBehaviors[selectedTrigger.id] || [];
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
            style={{ imageRendering: 'pixelated', width: '24px', height: '24px' }}
          /> }
          <div className="selected-trigger-label">
            <span className="action-icon-small">{selectedTrigger.icon}</span>
            {selectedTrigger.name}
          </div>
        </div>
      </>
    );
  };


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
      <InfoModal data={infoModalData} onClose={() => setInfoModalData(null)} />
    </div>
  );
}

export default ActionPanel;