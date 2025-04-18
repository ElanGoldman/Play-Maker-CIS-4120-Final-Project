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
  const [activePanel, setActivePanel] = useState('assets'); // 'assets' or 'actions'
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  
  const defaultAssets = [
    new Asset({
      id: 1,
      type: 'sprite',
      name: 'Mario',
      imgSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuXuam9tXIXUUCrh95GbURDwDjnr-PVret7w&s',
      width: 32,
      height: 32
    }),
    new Asset({
      id: 2,
      type: 'sprite',
      name: 'Luigi',
      imgSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf3j6_Bl1Bj0NxhykavlZOQBcTmXhzN0D-KQ&s',
      width: 32,
      height: 32
    }),
    new Asset({
      id: 3,
      type: 'object',
      name: 'Pipe',
      imgSrc: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Mario_pipe.png',
      width: 32,
      height: 32
    })
  ];
  
  const [availableAssets, setAvailableAssets] = useState(defaultAssets);

  // Load project data from localStorage, including custom assets
  useEffect(() => {
    setProjectName(`Project ${projectId}`);
    console.log("Loading project data for ID:", projectId);

    const savedProject = localStorage.getItem(`project_${projectId}`);
    if (savedProject) {
      try {
        const parsedProject = JSON.parse(savedProject);
        console.log("Loaded project data:", parsedProject);

        if (parsedProject.canvasAssets && Array.isArray(parsedProject.canvasAssets)) {
          const loadedAssets = parsedProject.canvasAssets.map(assetData => {
            const asset = new Asset(assetData);
  
            if (assetData.actions && Array.isArray(assetData.actions)) {
              asset.actions = assetData.actions.map(actionData =>
                new Action(actionData)
              );
            } else {
               asset.actions = []; 
            }
            return asset;
          });
  
          setCanvasAssets(loadedAssets);
        }
        
        setProjectName(parsedProject.name || `Project ${projectId}`);
        
        if (parsedProject.availableAssets && Array.isArray(parsedProject.availableAssets)) {
          // Filter out default assets by ID to avoid duplicates
          const defaultAssetIds = defaultAssets.map(asset => asset.id);
          const customAssets = parsedProject.availableAssets
            .filter(assetData => !defaultAssetIds.includes(assetData.id))
            .map(assetData => new Asset(assetData));
          
          const uniqueCustomAssets = [];
          const seenIds = new Set();
          
          customAssets.forEach(asset => {
            if (!seenIds.has(asset.id)) {
              seenIds.add(asset.id);
              uniqueCustomAssets.push(asset);
            } else {
              console.warn(`Duplicate asset ID found: ${asset.id} for ${asset.name}`);
            }
          });
          
          setAvailableAssets([...defaultAssets, ...uniqueCustomAssets]);
          console.log("Available assets set to:", [...defaultAssets, ...uniqueCustomAssets]);
        } else {
          setAvailableAssets(defaultAssets);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        setCanvasAssets([]);
        setAvailableAssets(defaultAssets);
      }
    } else {
      setCanvasAssets([]);
      setAvailableAssets(defaultAssets);
    }

    setActivePanel('assets');
    setSelectedAssetId(null);
    setIsOptionsVisible(false);
  }, [projectId]);

  // Update active panel based on selection
  useEffect(() => {
    if (selectedAssetId) {
      setActivePanel('actions');
      // Don't reset isOptionsVisible here - let the ActionPanel control it
    } else {
      setActivePanel('assets');
      setIsOptionsVisible(false);
    }
  }, [selectedAssetId]);

  // Save project data whenever canvas assets/project name/assets change
  useEffect(() => {
    if (canvasAssets.length === 0 && localStorage.getItem(`project_${projectId}`)) {
      return;
    }
    
    const defaultAssetIds = defaultAssets.map(asset => asset.id);
    const customAssets = availableAssets.filter(asset => !defaultAssetIds.includes(asset.id));
    
    const projectData = {
      id: projectId,
      name: projectName,
      lastSaved: new Date().toISOString(),
      canvasAssets: canvasAssets.map(asset => asset.toJSON()),
      availableAssets: customAssets.map(asset => asset.toJSON())
    };
    
    localStorage.setItem(`project_${projectId}`, JSON.stringify(projectData));
    console.log("Saved project data with custom assets:", customAssets.length);
    
  }, [canvasAssets, projectId, projectName, availableAssets]); 

  // Helper to get the currently selected asset object
  const getSelectedAsset = () => {
    if (!selectedAssetId) return null;
    return canvasAssets.find(asset => asset.canvasId === selectedAssetId);
  };

  // Handler for when an asset is dropped from the AssetPanel onto the Canvas
  const handleAssetDropped = (newAsset) => {
    const assetInstance = newAsset instanceof Asset
      ? newAsset
      : new Asset(newAsset);

    setCanvasAssets(prevAssets => {
      const updatedAssets = [...prevAssets, assetInstance];
      setTimeout(() => {
          window.dispatchEvent(new CustomEvent('playmaker:assetAdded', {
              detail: { assetId: assetInstance.canvasId }
          }));
          console.log('Dispatched playmaker:assetAdded');
      }, 0);
      return updatedAssets;
    });
  };

  // Handle asset selection on canvas
  const handleAssetSelected = (assetId) => {
    setSelectedAssetId(assetId);
    setIsOptionsVisible(false);
  };

  // Add action to the selected asset
  const handleAddAction = (action) => {
    if (!selectedAssetId) return;
    const actionInstance = action instanceof Action
      ? action
      : new Action(action);

    setCanvasAssets(prevAssets => {
      return prevAssets.map(asset => {
        if (asset.canvasId === selectedAssetId) {
          const updatedAsset = new Asset({
            ...asset,
            actions: [...asset.actions, actionInstance]
          });
          return updatedAsset;
        }
        return asset;
      });
    });
    setIsOptionsVisible(false);
  };

  const handleRemoveAction = (actionIdToRemove) => {
    if (!selectedAssetId) return;

    setCanvasAssets(prevAssets => {
      return prevAssets.map(asset => {
        if (asset.canvasId === selectedAssetId) {
           const updatedAsset = asset.removeAction(actionIdToRemove);

           return new Asset({ ...updatedAsset });
        }
        return asset;
      });
    });
  };

  const handleAssetResized = (assetId, newWidth, newHeight) => {
    setCanvasAssets(prevAssets => {
      return prevAssets.map(asset => {
        if (asset.canvasId === assetId) {
          const updatedAsset = new Asset({
            ...asset,
            width: newWidth,
            height: newHeight
          });

          return updatedAsset;
        }
        return asset;
      });
    });
  };

  const handleAssetDeleted = (assetId) => {
    setCanvasAssets(prevAssets => {
      return prevAssets.filter(asset => asset.canvasId !== assetId);
    });
    
    if (selectedAssetId === assetId) {
      setSelectedAssetId(null);
    }
  };

  // Handle adding a new asset to the available assets
  const handleAddAvailableAsset = (newAsset) => {
    const assetExists = availableAssets.some(asset => asset.id === newAsset.id);
    
    if (assetExists) {
      console.warn(`Asset with ID ${newAsset.id} already exists. Not adding duplicate.`);
      return;
    }
    
    console.log("Adding new available asset:", newAsset.name);
    setAvailableAssets(prevAssets => [...prevAssets, newAsset]);
  };

  // Toggle play/pause state for the canvas
  const handlePlayToggle = () => {
    // Save current state before entering play mode?
    if (!isPlaying) {
      // Store a copy of canvas assets for restoration later if needed?
      localStorage.setItem(
        `project_${projectId}_play_backup`,
        JSON.stringify(canvasAssets.map(asset => asset.toJSON()))
      );
    }
    // If exiting play mode, reset any ongoing animations?
    else {
      setCanvasAssets(prevAssets => {
        // Create fresh copies to trigger re-renders and reset animation state
        return prevAssets.map(asset => new Asset({ // Create new instances
          ...asset,
          actions: asset.actions.map(action => {
            const newAction = new Action(action);
            newAction.isRunning = false;
            return newAction;
          })
        }));
      });
    }

    setIsPlaying(!isPlaying);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  // Handler for back button in ActionPanel
  const handlePanelChange = (panel) => {
    setActivePanel(panel);
    if (panel === 'assets') {
      setSelectedAssetId(null);
      setIsOptionsVisible(false);
    }
  };

  const handleOptionsVisibilityChange = (isVisible) => {
    console.log('Options visibility changing to:', isVisible);
    setIsOptionsVisible(isVisible);
    
    setTimeout(() => {
      console.log('Options visibility after update:', isOptionsVisible);
    }, 100);
  };

  return (
    <div className="editor-page">
      <header className="editor-header">
        <input
           type="text"
           value={projectName}
           onChange={handleProjectNameChange}
           className="project-name-input"
           aria-label="Project Name"
        />
        <button className="back-button" onClick={handleBackToProjects}>
          Back to Projects
        </button>
      </header>

      <div className={`editor-layout ${isOptionsVisible ? 'options-expanded' : ''}`}>
        <div className="left-panel">
          {activePanel === 'assets' ? (
            <AssetPanel
              assets={availableAssets}
              onAddAsset={handleAddAvailableAsset}
            />
          ) : (
            <ActionPanel
              selectedAsset={getSelectedAsset()}
              onAddAction={handleAddAction}
              onRemoveAction={handleRemoveAction}
              onSwitchToAssets={() => handlePanelChange('assets')}
              onOptionsVisibilityChange={handleOptionsVisibilityChange}
            />
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
        />
      </div>
    </div>
  );
}

export default EditorPage;