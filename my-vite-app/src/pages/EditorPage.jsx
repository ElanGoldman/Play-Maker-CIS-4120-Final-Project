import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssetPanel from '../components/AssetPanel';
import Canvas from '../components/Canvas';
import ActionPanel from '../components/ActionPanel';
import Asset from '../models/Asset';
import Action from '../models/Action';

function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [canvasAssets, setCanvasAssets] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [activePanel, setActivePanel] = useState('assets');
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [notification, setNotification] = useState('');
  const [notificationTimeoutId, setNotificationTimeoutId] = useState(null);

  const defaultAssets = [
    new Asset({ id: 'default-1', type: 'sprite', name: 'Mario', imgSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuXuam9tXIXUUCrh95GbURDwDjnr-PVret7w&s', width: 32, height: 32 }),
    new Asset({ id: 'default-2', type: 'sprite', name: 'Luigi', imgSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf3j6_Bl1Bj0NxhykavlZOQBcTmXhzN0D-KQ&s', width: 32, height: 32 }),
    new Asset({ id: 'default-3', type: 'object', name: 'Pipe', imgSrc: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Mario_pipe.png', width: 32, height: 32 })
  ];

  const showNotification = (message, duration = 2000) => {
    console.log("EDITOR NOTIFICATION CALL:", message);
    
    // Always clear any existing notification timeout
    if (notificationTimeoutId) {
      clearTimeout(notificationTimeoutId);
      setNotificationTimeoutId(null);
    }
    
    setNotification(message);
    
    // Set timeout to clear notification
    const timeoutId = setTimeout(() => {
      setNotification(currentMsg => currentMsg === message ? '' : currentMsg);
      setNotificationTimeoutId(null);
    }, duration);
    
    setNotificationTimeoutId(timeoutId);
  };

  useEffect(() => {
    return () => {
      if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
      }
    };
  }, [notificationTimeoutId]);


  useEffect(() => {
    setProjectName(`Project ${projectId}`);
    console.log("Loading project data for ID:", projectId);
    const savedProject = localStorage.getItem(`project_${projectId}`);
    let loadedCustomAssets = [];
    if (savedProject) {
      try {
        const parsedProject = JSON.parse(savedProject);
        console.log("Loaded project data:", parsedProject);
        if (parsedProject.canvasAssets && Array.isArray(parsedProject.canvasAssets)) {
          const loadedAssets = parsedProject.canvasAssets.map(assetData => {
            const asset = new Asset(assetData);
            if (assetData.actions && Array.isArray(assetData.actions)) {
              asset.actions = assetData.actions.map(actionData => new Action(actionData));
            } else { asset.actions = []; }
            return asset;
          });
          setCanvasAssets(loadedAssets);
        } else { setCanvasAssets([]); }
        setProjectName(parsedProject.name || `Project ${projectId}`);
        if (parsedProject.availableAssets && Array.isArray(parsedProject.availableAssets)) {
          loadedCustomAssets = parsedProject.availableAssets.map(assetData => new Asset(assetData));
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        setCanvasAssets([]);
        setProjectName(`Project ${projectId}`);
      }
    } else {
       setCanvasAssets([]);
       setProjectName(`Project ${projectId}`);
    }
    const combinedAvailableAssets = [...defaultAssets];
    const seenCustomAssetIds = new Set();
    loadedCustomAssets.forEach(customAsset => {
        const isDefaultId = defaultAssets.some(defAsset => defAsset.id === customAsset.id);
        if (!isDefaultId && !seenCustomAssetIds.has(customAsset.id)) {
            combinedAvailableAssets.push(customAsset);
            seenCustomAssetIds.add(customAsset.id);
        } else if (seenCustomAssetIds.has(customAsset.id)) { console.warn(`Duplicate custom asset ID found during load: ${customAsset.id}. Skipping.`); }
        else if (isDefaultId) { console.warn(`Custom asset ID ${customAsset.id} clashes with a default asset ID. Skipping.`); }
    });
    setAvailableAssets(combinedAvailableAssets);
    console.log("Available assets initialized/loaded:", combinedAvailableAssets.length);
    setActivePanel('assets');
    setSelectedAssetId(null);
    setIsOptionsVisible(false);
  }, [projectId]);

  useEffect(() => {
    if (selectedAssetId) { setActivePanel('actions'); }
    else { setActivePanel('assets'); setIsOptionsVisible(false); }
  }, [selectedAssetId]);

  useEffect(() => {
    if (!projectId || !projectName) return;
     const initialLoad = canvasAssets.length === 0 && availableAssets.length === defaultAssets.length;
     if (initialLoad && localStorage.getItem(`project_${projectId}`)) { return; }
    const defaultAssetIds = defaultAssets.map(asset => asset.id);
    const customAssetsToSave = availableAssets.filter(asset => !defaultAssetIds.includes(asset.id));
    const projectData = { id: projectId, name: projectName, lastSaved: new Date().toISOString(), canvasAssets: canvasAssets.map(asset => asset.toJSON()), availableAssets: customAssetsToSave.map(asset => asset.toJSON()) };
    try { localStorage.setItem(`project_${projectId}`, JSON.stringify(projectData)); }
    catch (error) { console.error("Error saving project data:", error); showNotification("Error saving project!", 5000); }
  }, [canvasAssets, projectId, projectName, availableAssets]);

  const getSelectedAsset = () => {
    if (!selectedAssetId) return null;
    return canvasAssets.find(asset => asset.canvasId === selectedAssetId);
  };

  const handleAssetDropped = (newAsset) => {
    const assetInstance = newAsset instanceof Asset ? newAsset : new Asset(newAsset);
    setCanvasAssets(prevAssets => {
      const updatedAssets = [...prevAssets, assetInstance];
      setTimeout(() => { window.dispatchEvent(new CustomEvent('playmaker:assetAdded', { detail: { assetId: assetInstance.canvasId } })); console.log('Dispatched playmaker:assetAdded'); }, 0);
      return updatedAssets;
    });
  };

  const handleAssetSelected = (assetId) => {
    setSelectedAssetId(assetId);
    setIsOptionsVisible(false);
  };

  const handleAddAction = (action) => {
    if (!selectedAssetId) return;
    
    const actionInstance = action instanceof Action ? action : new Action(action);
    console.log(`Adding action: ${actionInstance.type} -> ${actionInstance.behavior} to asset ${selectedAssetId}`);
    
    let actionAdded = false;
    setCanvasAssets(prevAssets => {
      const assetIndex = prevAssets.findIndex(asset => asset.canvasId === selectedAssetId);
      if (assetIndex === -1) return prevAssets;
      
      const assetToUpdate = prevAssets[assetIndex];
      const actionExists = assetToUpdate.actions.some(existingAction => 
        existingAction.type === actionInstance.type && existingAction.behavior === actionInstance.behavior
      );
      
      if (actionExists) {
        showNotification(`Action '${actionInstance.type} -> ${actionInstance.behavior}' already exists.`);
        return prevAssets;
      }
      
      const updatedAsset = new Asset({ 
        ...assetToUpdate, 
        actions: [...assetToUpdate.actions, actionInstance] 
      });
      
      const newAssets = [...prevAssets];
      newAssets[assetIndex] = updatedAsset;
      actionAdded = true;
      return newAssets;
    });
    
    if (actionAdded) {
      setIsOptionsVisible(false);
    }
  };

  const handleRemoveAction = (actionIdToRemove) => {
    if (!selectedAssetId) return;
    setCanvasAssets(prevAssets => prevAssets.map(asset => {
      if (asset.canvasId === selectedAssetId) {
        // Find the action that's being removed
        const actionToRemove = asset.actions.find(action => action.id === actionIdToRemove);
        
        const updatedAsset = new Asset({ ...asset });
        
        updatedAsset.actions = asset.actions.filter(action => action.id !== actionIdToRemove);
        
        // Makes sure collision has been removed
        if (actionToRemove && actionToRemove.behavior === 'enableCollision') {
          updatedAsset.hasCollision = false;
        }
        
        return updatedAsset;
      }
      return asset;
    }));
  };

  const handleAssetResized = (assetId, newWidth, newHeight) => {
    setCanvasAssets(prevAssets => prevAssets.map(asset => {
      if (asset.canvasId === assetId) { const updatedAsset = new Asset({ ...asset, width: newWidth, height: newHeight }); return updatedAsset; }
      return asset;
    }));
  };

  const handleAssetDeleted = (assetId) => {
    setCanvasAssets(prevAssets => prevAssets.filter(asset => asset.canvasId !== assetId));
    if (selectedAssetId === assetId) { setSelectedAssetId(null); setIsOptionsVisible(false); }
  };

  const handleAddAvailableAsset = (newAsset) => {
    const assetExists = availableAssets.some(asset => asset.id === newAsset.id);
    if (assetExists) { showNotification(`Asset '${newAsset.name}' already imported.`); console.warn(`Asset with ID ${newAsset.id} already exists in availableAssets. Not adding duplicate.`); return; }
    console.log("Adding new available asset:", newAsset.name, newAsset.id);
    setAvailableAssets(prevAssets => [...prevAssets, newAsset]);
    showNotification(`Asset '${newAsset.name}' imported!`);
  };

  const handleAssetsUpdated = (updatedAssets) => {
    setCanvasAssets([...updatedAssets]);
  };

  const handlePlayToggle = () => {
    setIsPlaying(prevIsPlaying => {
        const nextIsPlaying = !prevIsPlaying;
        if (nextIsPlaying) {
            setSelectedAssetId(null);
            
            setCanvasAssets(currentAssets => {
                const preparedAssets = currentAssets.map(asset => {
                    // Create a clean copy of the asset
                    const playAsset = new Asset({...asset});
                    
                    // Reset collision states
                    playAsset.collidingWith = new Set();
                    playAsset.isCollidingAbove = false;
                    playAsset.isCollidingBelow = false;
                    playAsset.isCollidingLeft = false;
                    playAsset.isCollidingRight = false;
                    playAsset.isCollidingWithCanvas = false;
                    
                    playAsset.actions = asset.actions.map(action => new Action(action));
                    
                    playAsset.isAnimating = false;
                    
                    return playAsset;
                });
                
                // Run onStart actions
                preparedAssets.forEach(asset => {
                    asset.actions?.forEach(action => {
                        if (action.type === 'onStart') {
                            action.execute(asset, {});
                        }
                    });
                });
                
                return preparedAssets;
            });
        } else {
            setCanvasAssets(currentAssets => {
                return currentAssets.map(asset => {
                    const freshAsset = new Asset({...asset});
                    
                    freshAsset.actions = asset.actions.map(action => { 
                        const newAction = new Action(action); 
                        newAction.isRunning = false; 
                        return newAction; 
                    });
                    
                    freshAsset.velocityX = 0; 
                    freshAsset.velocityY = 0;
                    
                    freshAsset.isAnimating = false;
                    
                    freshAsset.hasCollision = asset.hasCollision;
                    freshAsset.collidingWith = new Set();
                    freshAsset.isCollidingAbove = false;
                    freshAsset.isCollidingBelow = false;
                    freshAsset.isCollidingLeft = false;
                    freshAsset.isCollidingRight = false;
                    
                    return freshAsset;
                });
            });
        }
        return nextIsPlaying;
    });
  };

  const handleAttemptSelectWhilePlaying = () => {
    showNotification("Cannot select or modify assets while playing.", 2000);
  };

  const handleBackToProjects = () => { navigate('/projects'); };
  const handleProjectNameChange = (event) => { setProjectName(event.target.value); };
  const handlePanelChange = (panel) => { setActivePanel(panel); if (panel === 'assets') { setSelectedAssetId(null); setIsOptionsVisible(false); } };
  const handleOptionsVisibilityChange = (isVisible) => { setIsOptionsVisible(isVisible); };

  return (
    <div className="editor-page">
      <header className="editor-header">
        <input type="text" value={projectName} onChange={handleProjectNameChange} className="project-name-input" aria-label="Project Name"/>
        <button className="back-button" onClick={handleBackToProjects}> Back to Projects </button>
      </header>
      
      {notification && (
        <div className="editor-notification">
          {notification}
        </div>
      )}
      
      <div className={`editor-layout ${isOptionsVisible ? 'options-expanded' : ''}`}>
        <div className="left-panel">
          {activePanel === 'assets' ? (
            <AssetPanel assets={availableAssets} onAddAsset={handleAddAvailableAsset} />
          ) : (
            <ActionPanel selectedAsset={getSelectedAsset()} onAddAction={handleAddAction} onRemoveAction={handleRemoveAction} onSwitchToAssets={() => handlePanelChange('assets')} onOptionsVisibilityChange={handleOptionsVisibilityChange} />
          )}
        </div>
        <Canvas
          assets={canvasAssets}
          selectedAssetId={selectedAssetId}
          onAssetSelected={handleAssetSelected}
          onAssetDraggedToCanvas={handleAssetDropped}
          onAssetResized={handleAssetResized}
          onAssetDeleted={handleAssetDeleted}
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
          onAttemptSelectWhilePlaying={handleAttemptSelectWhilePlaying}
          onAssetsUpdated={handleAssetsUpdated}
          showNotification={showNotification}
        />
      </div>
    </div>
  );
}

export default EditorPage;