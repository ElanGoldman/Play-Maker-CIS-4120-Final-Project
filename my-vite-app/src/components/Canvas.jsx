import { useState, useEffect, useRef } from 'react';
import Asset from '../models/Asset';

function Canvas({ assets, selectedAssetId, onAssetSelected, isPlaying, onPlayToggle, onAssetDraggedToCanvas, onAssetResized }) {
  const canvasRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [assetImages, setAssetImages] = useState({});
  const [gameState, setGameState] = useState({
    lastTimestamp: 0,
    keyState: {} // Track keys that are currently pressed
  });
  
  // New state for resize interaction
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeAsset, setResizeAsset] = useState(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [cursorStyle, setCursorStyle] = useState('default');
  
  // Reference to assets for use in callbacks
  const assetsRef = useRef(assets);
  
  // Update assets ref whenever assets change
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  // Preload and cache all asset images
  useEffect(() => {
    const loadImages = async () => {
      const imageCache = { ...assetImages };
      const newImages = [];
      
      for (const asset of assets) {
        if (!imageCache[asset.imgSrc]) {
          newImages.push(asset.imgSrc);
          const img = new Image();
          img.src = asset.imgSrc;
          
          await new Promise((resolve) => {
            img.onload = () => {
              imageCache[asset.imgSrc] = img;
              resolve();
            };
            // If image fails to load, resolve anyway to prevent hanging
            img.onerror = () => resolve();
          });
        }
      }
      
      if (newImages.length > 0) {
        setAssetImages(imageCache);
        forceRedrawAssets();
      }
    };
    
    loadImages();
  }, [assets]);

  // Effect to force redraw when isPlaying changes 
  useEffect(() => {
    // Force a redraw on play/pause
    setTimeout(forceRedrawAssets, 50);
  }, [isPlaying, selectedAssetId]);

  const forceRedrawAssets = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    //Redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each asset
    assets.forEach(asset => {
      const img = assetImages[asset.imgSrc];
      if (img) {
        ctx.drawImage(img, asset.x, asset.y, asset.width, asset.height);
        
        //ALWAYS highlight selected asset regardless of play state
        if (asset.canvasId === selectedAssetId) {
          ctx.strokeStyle = '#64ffda';
          ctx.lineWidth = 3;
          ctx.strokeRect(
            asset.x - 4, 
            asset.y - 4, 
            asset.width + 8, 
            asset.height + 8
          );
          
          // Draw resizable icon
          const handleSize = 10;
          ctx.fillStyle = '#64ffda';
          ctx.fillRect(
            asset.x + asset.width - handleSize/2,
            asset.y + asset.height - handleSize/2,
            handleSize,
            handleSize
          );
        }
      }
    });
  };

  // Handle keyboard events for game actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      
      setGameState(prev => ({
        ...prev,
        keyState: { ...prev.keyState, [e.code]: true }
      }));
      
      // Process space key press
      if (e.code === 'Space') {
        e.preventDefault();
        
        // Find assets with space press actions and execute them
        assetsRef.current.forEach(asset => {
          if (asset.actions && Array.isArray(asset.actions)) {
            asset.actions.forEach(action => {
              if (action.type === 'spacePress') {
                action.execute(asset, gameState);
              }
            });
          }
        });
      }
      
      if (e.code === 'ArrowUp') {
        assetsRef.current.forEach(asset => {
          if (asset.actions && Array.isArray(asset.actions)) {
            asset.actions.forEach(action => {
              if (action.type === 'keyPress') {
                action.execute(asset, gameState);
              }
            });
          }
        });
      }
    };
    
    const handleKeyUp = (e) => {
      if (!isPlaying) return;
      
      setGameState(prev => {
        const newKeyState = { ...prev.keyState };
        delete newKeyState[e.code];
        return { ...prev, keyState: newKeyState };
      });
    };
    
    // Add event listeners when in play mode
    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      assetsRef.current.forEach(asset => {
        if (asset.actions && Array.isArray(asset.actions)) {
          asset.actions.forEach(action => {
            if (action.type === 'onStart') {
              action.execute(asset, gameState);
            }
          });
        }
      });
      
      let animationFrameId;
      
      const gameLoop = (timestamp) => {
        const deltaTime = timestamp - gameState.lastTimestamp;
        
        setGameState(prev => ({ ...prev, lastTimestamp: timestamp }));
        forceRedrawAssets();
        
        animationFrameId = requestAnimationFrame(gameLoop);
      };
      
      // Start the game loop
      animationFrameId = requestAnimationFrame(gameLoop);
      
      // Cleanup
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isPlaying, gameState.lastTimestamp, selectedAssetId]);

  // Draw the assets on the canvas
  useEffect(() => {
    forceRedrawAssets();
  }, [assets, selectedAssetId, assetImages]);

  // Check if point is over a resize handle
  const isOverResizeHandle = (x, y, asset) => {
    const handleSize = 10;
    const handleX = asset.x + asset.width - handleSize/2;
    const handleY = asset.y + asset.height - handleSize/2;
    
    return (
      x >= handleX && x <= handleX + handleSize &&
      y >= handleY && y <= handleY + handleSize
    );
  };
  
  // Handle mouse move for cursor updates and resize preview
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isResizing && resizeAsset) {
      const newWidth = Math.max(32, initialSize.width + (x - resizeStartPos.x));
      const newHeight = Math.max(32, initialSize.height + (y - resizeStartPos.y));
      
      setCursorStyle('nwse-resize');
      
      // Update canvas to show resize preview
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw each asset
      assets.forEach(asset => {
        const img = assetImages[asset.imgSrc];
        if (img) {
          if (asset.canvasId === resizeAsset.canvasId) {
            ctx.drawImage(img, asset.x, asset.y, newWidth, newHeight);
            ctx.strokeStyle = '#64ffda';
            ctx.lineWidth = 3;
            ctx.strokeRect(asset.x - 4, asset.y - 4, newWidth + 8, newHeight + 8);
            
            // Draw resize handle
            const handleSize = 10;
            ctx.fillStyle = '#64ffda';
            ctx.fillRect(
              asset.x + newWidth - handleSize/2,
              asset.y + newHeight - handleSize/2,
              handleSize,
              handleSize
            );
          } else {
            ctx.drawImage(img, asset.x, asset.y, asset.width, asset.height);
            
            if (asset.canvasId === selectedAssetId && asset.canvasId !== resizeAsset.canvasId) {
              ctx.strokeStyle = '#64ffda';
              ctx.lineWidth = 3;
              ctx.strokeRect(
                asset.x - 4, 
                asset.y - 4, 
                asset.width + 8, 
                asset.height + 8
              );
              
              const handleSize = 10;
              ctx.fillStyle = '#64ffda';
              ctx.fillRect(
                asset.x + asset.width - handleSize/2,
                asset.y + asset.height - handleSize/2,
                handleSize,
                handleSize
              );
            }
          }
        }
      });
      
      return;
    }
    
    // Check if mouse is over a resize handle of the selected asset
    const selectedAsset = assets.find(asset => asset.canvasId === selectedAssetId);
    if (selectedAsset && isOverResizeHandle(x, y, selectedAsset)) {
      setCursorStyle('nwse-resize');
    } else {
      setCursorStyle('default');
    }
  };
  
  // Handle mouse down for selection and resize start
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is on the resize handle of selected asset
    const selectedAsset = assets.find(asset => asset.canvasId === selectedAssetId);
    if (selectedAsset && isOverResizeHandle(x, y, selectedAsset)) {
      setIsResizing(true);
      setResizeStartPos({ x, y });
      setResizeAsset(selectedAsset);
      setInitialSize({ width: selectedAsset.width, height: selectedAsset.height });
      setCursorStyle('nwse-resize');
      return; 
    }
    
    // Check if click is on an asset (from top to bottom)
    for (let i = assets.length - 1; i >= 0; i--) {
      const asset = assets[i];
      
      if (asset.containsPoint(x, y)) {
        onAssetSelected(asset.canvasId);
        
        // Force an immediate redraw to show selection
        setTimeout(forceRedrawAssets, 0);
        
        return;
      }
    }
    // If clicked on empty space, deselect
    onAssetSelected(null);
  };
  
  // Handle mouse up to complete resize operation
  const handleMouseUp = (e) => {
    if (isResizing && resizeAsset) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      // Get current mouse position
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate final dimensions
      const newWidth = Math.max(32, initialSize.width + (x - resizeStartPos.x));
      const newHeight = Math.max(32, initialSize.height + (y - resizeStartPos.y));
      
      // Update the asset with new dimensions
      if (typeof onAssetResized === 'function') {
        onAssetResized(resizeAsset.canvasId, newWidth, newHeight);
      }
    }
    
    // Reset resize state and draw
    setIsResizing(false);
    setResizeAsset(null);
    setCursorStyle('default');
    forceRedrawAssets();
  };
  
  // Handle canvas exit to cancel resize
  const handleMouseOut = () => {
    if (isResizing) {
      setIsResizing(false);
      setResizeAsset(null);
      setCursorStyle('default');
      forceRedrawAssets();
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    // Get the asset data from drag operation
    const assetData = e.dataTransfer.getData('application/json');
    if (!assetData) return;
    
    try {
      const assetTemplate = JSON.parse(assetData);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create a new asset instance with position where it was dropped
      const newAsset = new Asset({
        ...assetTemplate,
        canvasId: `canvas-${Date.now()}`,
        // Center the asset on cursor
        x: x - (assetTemplate.width / 2),
        y: y - (assetTemplate.height / 2),
        actions: []
      });
      
      // Ensure we have the image loaded before proceeding
      const ensureImageLoaded = () => {
        if (assetImages[newAsset.imgSrc]) {
          // Image already in cache, add asset to canvas
          onAssetDraggedToCanvas(newAsset);
          forceRedrawAssets();
        } else {
          // Load the image first
          const img = new Image();
          img.src = newAsset.imgSrc;
          
          img.onload = () => {
            // Add to image cache
            setAssetImages(prev => ({
              ...prev,
              [newAsset.imgSrc]: img
            }));
            
            // Add asset to canvas
            onAssetDraggedToCanvas(newAsset);
            forceRedrawAssets();
          };
          
          img.onerror = () => {
            console.error('Failed to load image:', newAsset.imgSrc);
            onAssetDraggedToCanvas(newAsset);
          };
        }
      };
      
      // Ensure image is loaded and asset is drawn
      ensureImageLoaded();
      
    } catch (error) {
      console.error('Error adding asset to canvas:', error);
    }
  };

  // Handle play toggle with forced redraw
  const handlePlayToggle = () => {
    onPlayToggle();
    setTimeout(forceRedrawAssets, 50);
  };

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${isPlaying ? 'playing' : ''} ${isDraggingOver ? 'drag-over' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{ cursor: cursorStyle }}
      />
      
      <button 
        className="play-button" 
        onClick={handlePlayToggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}

export default Canvas;