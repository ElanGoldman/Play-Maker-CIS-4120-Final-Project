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
  
  // TODO:Will need to update for our new tutuorial game
  const [availableAssets] = useState([
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
  ]);
  
  // Load project data
  useEffect(() => {
    setProjectName(`Project ${projectId}`);
    
    // Load saved project if available
    const savedProject = localStorage.getItem(`project_${projectId}`);
    if (savedProject) {
      try {
        const parsedProject = JSON.parse(savedProject);
        
        const loadedAssets = parsedProject.canvasAssets.map(assetData => {
          const asset = new Asset(assetData);
          
          if (assetData.actions && Array.isArray(assetData.actions)) {
            asset.actions = assetData.actions.map(actionData => 
              new Action(actionData)
            );
          }
          
          return asset;
        });
        
        setCanvasAssets(loadedAssets);
        setProjectName(parsedProject.name);
      } catch (error) {
        console.error('Error loading project data:', error);
        setCanvasAssets([]);
      }
    } else {
      setCanvasAssets([]);
    }
    
    // Always start with assets panel when loading a project
    setActivePanel('assets');
    setSelectedAssetId(null);
  }, [projectId]);
  
  // Update active panel based on selection
  useEffect(() => {
    console.log('Selected asset changed:', selectedAssetId);
    
    // If an asset is selected, show actions panel
    if (selectedAssetId) {
      console.log('Switching to actions panel');
      setActivePanel('actions');
    } else {
      setActivePanel('assets');
    }
  }, [selectedAssetId]);
  
  // Save project data whenever canvas assets change
  useEffect(() => {
    const projectData = {
      id: projectId,
      name: projectName,
      lastSaved: new Date().toISOString(),
      canvasAssets: canvasAssets.map(asset => asset.toJSON())
    };
    
    localStorage.setItem(`project_${projectId}`, JSON.stringify(projectData));
    console.log('Project saved:', projectData);
  }, [canvasAssets, projectId, projectName]);
  
  const getSelectedAsset = () => {
    if (!selectedAssetId) return null;
    return canvasAssets.find(asset => asset.canvasId === selectedAssetId);
  };
  
  const handleAssetDropped = (newAsset) => {
    console.log('Asset dropped on canvas:', newAsset);
    
    const assetInstance = newAsset instanceof Asset 
      ? newAsset 
      : new Asset(newAsset);
    
    setCanvasAssets(prevAssets => [...prevAssets, assetInstance]);
    
  };
  
  // Handle asset selection on canvas
  const handleAssetSelected = (assetId) => {
    console.log('Asset selected:', assetId);
    setSelectedAssetId(assetId);
  };
  
  // Add action to the selected asset
  const handleAddAction = (action) => {
    if (!selectedAssetId) return;
    
    console.log('Adding action to asset:', action);
    
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
  };
  
  const handleAssetResized = (assetId, newWidth, newHeight) => {
    console.log('Resizing asset:', assetId, 'to', newWidth, 'x', newHeight);
    
    // Update the asset with new dimensions
    setCanvasAssets(prevAssets => {
      return prevAssets.map(asset => {
        if (asset.canvasId === assetId) {
          // Create a new asset with updated dimensions
          const updatedAsset = new Asset({
            ...asset,
            width: newWidth,
            height: newHeight
          });
          
          // Copies actions over to new copy
          updatedAsset.actions = [...asset.actions];
          
          return updatedAsset;
        }
        return asset;
      });
    });
  };
  
  const handlePlayToggle = () => {
    // Save current state before entering play mode
    if (!isPlaying) {
      // Store a copy of canvas assets for restoration later if needed
      localStorage.setItem(
        `project_${projectId}_play_backup`, 
        JSON.stringify(canvasAssets.map(asset => asset.toJSON()))
      );
    } 
    // If exiting play mode, reset any ongoing animations
    else {
      setCanvasAssets(prevAssets => {
        // Create fresh copies to trigger re-renders
        return prevAssets.map(asset => new Asset({
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

  return (
    <div className="editor-page">
      <header className="editor-header">
        <h1>{projectName}</h1>
        <button className="back-button" onClick={handleBackToProjects}>
          Back to Projects
        </button>
      </header>
      
      <div className="editor-layout">
        {/* Left panel - conditional render based on state */}
        <div className="left-panel">
          {activePanel === 'assets' ? (
            <AssetPanel 
              assets={availableAssets}
              onAddAsset={() => {}}
            />
          ) : (
            <ActionPanel 
              selectedAsset={getSelectedAsset()}
              onAddAction={handleAddAction}
            />
          )}
        </div>
        
        <Canvas 
          assets={canvasAssets}
          selectedAssetId={selectedAssetId}
          onAssetSelected={handleAssetSelected}
          onAssetDraggedToCanvas={handleAssetDropped}
          onAssetResized={handleAssetResized}
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
        />
      </div>
    </div>
  );
}

export default EditorPage;