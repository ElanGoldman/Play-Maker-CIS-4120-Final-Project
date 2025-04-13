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

  // TODO: Will need to update for our new tutuorial game
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

  useEffect(() => {
    setProjectName(`Project ${projectId}`);

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
          } else {
             asset.actions = []; 
          }
          return asset;
        });

        setCanvasAssets(loadedAssets);
        setProjectName(parsedProject.name || `Project ${projectId}`);
      } catch (error) {
        console.error('Error loading project data:', error);
        setCanvasAssets([]);
      }
    } else {
      setCanvasAssets([]);
    }

    setActivePanel('assets');
    setSelectedAssetId(null);
  }, [projectId]);

  // Update active panel based on selection
  useEffect(() => {
    if (selectedAssetId) {
      setActivePanel('actions');
    } else {
      setActivePanel('assets');
    }
  }, [selectedAssetId]);

  // Save project data whenever canvas assets or project name change
  useEffect(() => {
    if (canvasAssets.length === 0 && localStorage.getItem(`project_${projectId}`)) {
    } else {
       const projectData = {
         id: projectId,
         name: projectName,
         lastSaved: new Date().toISOString(),
         canvasAssets: canvasAssets.map(asset => asset.toJSON())
       };
       localStorage.setItem(`project_${projectId}`, JSON.stringify(projectData));
    }
  }, [canvasAssets, projectId, projectName]); // Trigger save when these change

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

    setCanvasAssets(prevAssets => [...prevAssets, assetInstance]);
  };

  // Handle asset selection on canvas
  const handleAssetSelected = (assetId) => {
    setSelectedAssetId(assetId);
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
            const newAction = new Action(action); // Create new action instance
            newAction.isRunning = false; // Reset isRunning flag
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

  // Handler for switching to assets panel
  const handleSwitchToAssetsPanel = () => {
    setActivePanel('assets');
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

      <div className="editor-layout">
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
              onRemoveAction={handleRemoveAction}
              onSwitchToAssets={handleSwitchToAssetsPanel}
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