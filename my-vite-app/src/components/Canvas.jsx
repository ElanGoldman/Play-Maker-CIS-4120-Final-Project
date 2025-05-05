import { useState, useEffect, useRef } from 'react';
import Asset from '../models/Asset';

function Canvas({
    assets,
    selectedAssetId,
    onAssetSelected,
    isPlaying,
    onPlayToggle,
    onAssetDraggedToCanvas,
    onAssetResized,
    onAssetDeleted,
    onAttemptSelectWhilePlaying,
    onAssetsUpdated,
    showNotification
}) {

  const canvasRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [assetImages, setAssetImages] = useState({});
  const [gameState, setGameState] = useState({ 
    lastTimestamp: 0, 
    keyState: {},
    mousePosition: { x: 0, y: 0 }
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeAsset, setResizeAsset] = useState(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [cursorStyle, setCursorStyle] = useState('default');
  const [draggingAsset, setDraggingAsset] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const assetsRef = useRef(assets);
  const gameStateRef = useRef(gameState);
  const previousPositionsRef = useRef({});
  const debugRef = useRef({
    previousPositions: {},
    movementBlocked: false
  });

  useEffect(() => { 
    assetsRef.current = assets; 
  }, [assets]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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

  useEffect(() => { 
    setTimeout(forceRedrawAssets, 50); 
  }, [isPlaying, selectedAssetId]);

  const forceRedrawAssets = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    assets.forEach(asset => {
      const img = assetImages[asset.imgSrc];
      if (img) {
        const opacity = asset.opacity !== undefined ? asset.opacity : 1;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, asset.x, asset.y, asset.width, asset.height);
        
        // Draw collision indicator if asset has collision enabled 
        // (CAN COMMENT THIS PART OUT TO REMOVE HIGHLIGHT)
        if (asset.hasCollision) {
          ctx.strokeStyle = '#ff0000'; // Red border for collision-enabled assets
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]); // Dashed line
          ctx.strokeRect(asset.x, asset.y, asset.width, asset.height);
          ctx.setLineDash([]);
        }
        
        // Draw win collision indicator if asset has winCollision enabled
        if (asset.isWinObject) {
          ctx.strokeStyle = '#00ff00';//green
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(asset.x - 2, asset.y - 2, asset.width + 4, asset.height + 4);
          ctx.setLineDash([]);
        }
        
        ctx.restore();
        
        if (asset.canvasId === selectedAssetId && !isPlaying) {
          ctx.strokeStyle = '#64ffda'; 
          ctx.lineWidth = 3;
          ctx.strokeRect(asset.x - 4, asset.y - 4, asset.width + 8, asset.height + 8);
          const handleSize = 10; 
          ctx.fillStyle = '#64ffda';
          ctx.fillRect(asset.x + asset.width - handleSize/2, asset.y + asset.height - handleSize/2, handleSize, handleSize);
        }
      }
    });
  };
  
  const handleWinNotification = () => {
    if (typeof showNotification === 'function') {
      showNotification("🏆 YOU WIN! 🏆");
    }
    return true;
  };

  // Check for collisions between assets and handle them
  const checkCollisions = (currentAssets) => {
    // Store current positions to detect changes
    let positions = {};
    let positionsChanged = false;
    let winCollisionDetected = false;
    
    // First, clear all collision states
    currentAssets.forEach(asset => {
      asset.collidingWith = new Set();
      positions[asset.canvasId] = { x: asset.x, y: asset.y };
    });
    
    // Check for collisions between assets with collision enabled
    for (let i = 0; i < currentAssets.length; i++) {
      const assetA = currentAssets[i];
  
      if (!assetA.hasCollision) continue;
  
      for (let j = i + 1; j < currentAssets.length; j++) {
        const assetB = currentAssets[j];
        if (!assetB.hasCollision) continue;
        
        // Check if these two assets are colliding using their actual sizes
        if (isCollidingWithCurrentSize(assetA, assetB)) {
          assetA.collidingWith.add(assetB.canvasId);
          assetB.collidingWith.add(assetA.canvasId);
          
          if ((assetA.isWinObject || assetB.isWinObject) && isPlaying) {
            winCollisionDetected = true;
            console.log("Win collision detected!", { 
              assetA: assetA.name, 
              assetB: assetB.name,
              isAWinObject: assetA.isWinObject,
              isBWinObject: assetB.isWinObject
            });
          }
          
          // Handle hard collision (prevent overlapping)
          resolveCollision(assetA, assetB);

          // Reset velocities to prevent further movement
          assetA.velocityX = 0;
          assetA.velocityY = 0;
          assetB.velocityX = 0;
          assetB.velocityY = 0;
          assetA.canJump = true; // Reset jump state if hitting another asset
          assetB.canJump = true; // Reset jump state if hitting another asset
          positionsChanged = true;
        }
      }
    }
    
    // Apply canvas boundaries
    const canvas = canvasRef.current;
    if (canvas) {
      currentAssets.forEach(asset => {
        if (asset.hasCollision) {
          const oldX = asset.x;
          const oldY = asset.y;
          
          const bound = (value, min, max) => Math.max(min, Math.min(value, max));
          asset.x = bound(asset.x, 0, canvas.width - asset.width);
          asset.y = bound(asset.y, 0, canvas.height - asset.height);
          
          if (oldX !== asset.x || oldY !== asset.y) {
            positionsChanged = true;
            asset.velocityX = 0;
            asset.velocityY = 0;
            asset.canJump = true; // Reset jump state if hitting a wall
          }
        }
      });
    }
    
    // Update the previousPositions for the next frame
    previousPositionsRef.current = positions;
    
    // Handle win state with notification
    if (winCollisionDetected) {
      console.log("Win collision detected! NOTIFY FUNCTION");
      handleWinNotification();
    }
    
    // If positions changed, update the assets
    if (positionsChanged && typeof onAssetsUpdated === 'function') {
      onAssetsUpdated(currentAssets);
    }
    
    return currentAssets;
  };
  
  // Improved collision detection using current asset sizes
  const isCollidingWithCurrentSize = (assetA, assetB) => {
    return (
      assetA.x < assetB.x + assetB.width &&
      assetA.x + assetA.width > assetB.x &&
      assetA.y < assetB.y + assetB.height &&
      assetA.y + assetA.height > assetB.y
    );
  };
  
  // Resolve collision between two assets by pushing them apart
  const resolveCollision = (assetA, assetB) => {
    // Calculate centers
    const centerA = {
      x: assetA.x + assetA.width / 2,
      y: assetA.y + assetA.height / 2
    };
    
    const centerB = {
      x: assetB.x + assetB.width / 2,
      y: assetB.y + assetB.height / 2
    };
    
    // Calculate overlap
    const overlapX = (assetA.width / 2 + assetB.width / 2) - Math.abs(centerA.x - centerB.x);
    const overlapY = (assetA.height / 2 + assetB.height / 2) - Math.abs(centerA.y - centerB.y);
    
    if (overlapX < overlapY) {
      if (centerA.x < centerB.x) {
        if (assetA.hasGravity && !assetB.hasGravity) {
          assetA.x -= overlapX;
        } else if (!assetA.hasGravity && assetB.hasGravity) {
          assetB.x += overlapX;
        } else {
          assetA.x -= overlapX / 2;
          assetB.x += overlapX / 2;
        }
        assetA.velocityX = 0; 
        assetB.velocityX = 0;
      } else {
        if (assetA.hasGravity && !assetB.hasGravity) {
          assetA.x += overlapX;
        } else if (!assetA.hasGravity && assetB.hasGravity) {
          assetB.x -= overlapX;
        } else {
          assetA.x += overlapX / 2;
          assetB.x -= overlapX / 2;
        }
        assetA.velocityX = 0;
        assetB.velocityX = 0;
      }
    } else {
      // Resolve vertically - push both objects
      if (centerA.y < centerB.y) {
        console.log("Collision detected: ", assetA.name, assetB.name);
        if (assetA.hasGravity && !assetB.hasGravity) {
          assetA.y -= overlapY;
        } else if (!assetA.hasGravity && assetB.hasGravity) {
          assetB.y += overlapY;
        } else {
          assetA.y -= overlapY / 2;
          assetB.y += overlapY / 2;
        }
        assetA.velocityY = 0;
        assetB.velocityY = 0;
      } else {
        console.log("Collision detected: ", assetA.name, assetB.name);
        if (assetA.hasGravity && !assetB.hasGravity) {
          assetA.y += overlapY;
        } else if (!assetA.hasGravity && assetB.hasGravity) {
          assetB.y -= overlapY;
        } else {
          assetA.y += overlapY / 2;
          assetB.y -= overlapY / 2;
        }
        assetA.velocityY = 0;
        assetB.velocityY = 0;
      }
    }
    
    // Keep assets within canvas boundaries
    // (CAN DELETE IF WE DON'T PLAN TO HAVE BOUNDS)
    const canvas = canvasRef.current;
    if (canvas) {
      const bound = (value, min, max) => Math.max(min, Math.min(value, max));
      
      assetA.x = bound(assetA.x, 0, canvas.width - assetA.width);
      assetA.y = bound(assetA.y, 0, canvas.height - assetA.height);
      
      assetB.x = bound(assetB.x, 0, canvas.width - assetB.width);
      assetB.y = bound(assetB.y, 0, canvas.height - assetB.height);
    }
  };

  // Process a movement action for a single asset
  const processSingleAssetMovement = (asset, deltaX, deltaY) => {
    if (!asset) return false;
    
    // Store original position before movement
    const originalX = asset.x;
    const originalY = asset.y;
    
    // Apply movement
    asset.x += deltaX;
    asset.y += deltaY;
    
    // Apply canvas boundaries
    const canvas = canvasRef.current;
    if (canvas) {
      const bound = (value, min, max) => Math.max(min, Math.min(value, max));
      asset.x = bound(asset.x, 0, canvas.width - asset.width);
      asset.y = bound(asset.y, 0, canvas.height - asset.height);
    }
    
    let collisionOccurred = false;
    
    // If asset has collision enabled, check for collisions against other assets
    if (asset.hasCollision) {
      assetsRef.current.forEach(otherAsset => {
        if (otherAsset.canvasId === asset.canvasId || !otherAsset.hasCollision) return;
        
        if (isCollidingWithCurrentSize(asset, otherAsset)) {
          collisionOccurred = true;
          asset.collidingWith.add(otherAsset.canvasId);
          otherAsset.collidingWith.add(asset.canvasId);
          
          // Check for win collision
          if ((asset.isWinObject || otherAsset.isWinObject) && isPlaying) {
            console.log("Win collision detected during movement!", {
              asset: asset.name,
              otherAsset: otherAsset.name,
              isAssetWinObject: asset.isWinObject,
              isOtherWinObject: otherAsset.isWinObject
            });
            
            handleWinNotification();
          }
          
          asset.x = originalX;
          asset.y = originalY;
          
          // Stop velocity
          asset.velocityX = 0;
          asset.velocityY = 0;
        }
      });
    }
    
    return true;
  };

  // Process all active key actions at one time
  const processKeyActions = () => {
    if (!isPlaying) {
      return;
    }
    
    // Map of key codes to action types
    const keyActionMap = {
      'Space': 'spacePress',
      'ArrowUp': 'keyPress',
      'ArrowDown': 'keyPressDown',
      'ArrowLeft': 'keyPressLeft',
      'ArrowRight': 'keyPressRight'
    };
    
    // Process all currently pressed keys
    Object.entries(gameStateRef.current.keyState).forEach(([keyCode, isPressed]) => {
      if (isPressed) {
        const actionType = keyActionMap[keyCode];
        
        if (actionType) {
          assetsRef.current.forEach(asset => {
            if (!asset.actions || asset.actions.length === 0) return;
            
            // Track if position changes
            const originalX = asset.x;
            const originalY = asset.y;
            
            // Execute all relevant actions
            asset.actions.forEach(action => {
              if (action.type === actionType && action.enabled) {
                // Special handling for setVector action which affects velocity
                if (action.behavior === 'setVector') {
                  // Apply the velocity directly as movement
                  if (action.parameters.x !== undefined || action.parameters.y !== undefined) {
                    const deltaX = action.parameters.x || 0;
                    const deltaY = action.parameters.y || 0;
                    
                    // Process movement with collision checking
                    processSingleAssetMovement(asset, deltaX, deltaY);
                  }
                } else {
                  // For other action types (like jump), execute normally
                  action.execute(asset, gameStateRef.current);
                }
              }
            });
            
            // If position changed after actions, check collisions again
            if (asset.x !== originalX || asset.y !== originalY) {
              // Apply canvas boundary constraints
              const canvas = canvasRef.current;
              if (canvas) {
                const bound = (value, min, max) => Math.max(min, Math.min(value, max));
                asset.x = bound(asset.x, 0, canvas.width - asset.width);
                asset.y = bound(asset.y, 0, canvas.height - asset.height);
              }
            }
          });
          
          // Force redraw after actions
          forceRedrawAssets();
          
          // Check for collisions after all movements
          checkCollisions(assetsRef.current);
        }
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) {
        return;
      }
      
      // Prevent default key behaviors like scrolling the page
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      
      // Update key state
      setGameState(prev => {
        // Only update if key wasn't already pressed
        if (!prev.keyState[e.code]) {
          const newState = {
            ...prev,
            keyState: { ...prev.keyState, [e.code]: true }
          };
          return newState;
        }
        return prev;
      });
    };
    
    const handleKeyUp = (e) => {
      if (!isPlaying) {
        return;
      }
      
      setGameState(prev => {
        const newKeyState = { ...prev.keyState };
        if (newKeyState[e.code]) {
          delete newKeyState[e.code];
          return { ...prev, keyState: newKeyState };
        }
        return prev;
      });
    };

    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      // Initialize onStart actions
      assetsRef.current.forEach(asset => {
        asset.actions?.forEach(action => {
          if (action.type === 'onStart') {
            action.execute(asset, gameStateRef.current);
          }
        });
      });
      
      // Check initial collisions
      checkCollisions(assetsRef.current);
      
      // Set up game loop
      let animationFrameId;
      const gameLoop = (timestamp) => {
        const deltaTime = timestamp - gameStateRef.current.lastTimestamp;
        setGameState(prev => ({ ...prev, lastTimestamp: timestamp }));
        
        // Process all key actions in every frame
        processKeyActions();
        

        // Process assets with ongoing velocity
        let movementOccurred = false;
        assetsRef.current.forEach(asset => {
          asset.velocityX += asset.accelerationX;
          asset.velocityY += asset.accelerationY;

          if ((asset.velocityX || asset.velocityY) && !asset.isAnimating) {
            const oldX = asset.x;
            const oldY = asset.y;
            
            processSingleAssetMovement(asset, asset.velocityX, asset.velocityY);
            
            if (oldX !== asset.x || oldY !== asset.y) {
              movementOccurred = true;
            }
          }
        });
        
        if (movementOccurred) {
          checkCollisions(assetsRef.current);
        }
        
        forceRedrawAssets();
        animationFrameId = requestAnimationFrame(gameLoop);
      };
      
      animationFrameId = requestAnimationFrame(gameLoop);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(animationFrameId);
        
        // Clean up any running actions when game stops
        assetsRef.current.forEach(asset => {
          asset.actions?.forEach(action => {
            if (action.isRunning && typeof action.cleanup === 'function') {
              action.cleanup();
            }
          });
        });
      };
    }
  }, [isPlaying]);

  useEffect(() => { 
    forceRedrawAssets(); 
  }, [assets, selectedAssetId, assetImages]);

  const isOverResizeHandle = (x, y, asset) => {
    const handleSize = 10;
    const handleX = asset.x + asset.width - handleSize/2;
    const handleY = asset.y + asset.height - handleSize/2;
    return ( x >= handleX && x <= handleX + handleSize && y >= handleY && y <= handleY + handleSize );
  };

  const handleDeleteAsset = () => {
    if (selectedAssetId && typeof onAssetDeleted === 'function') { 
      onAssetDeleted(selectedAssetId); 
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current; 
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    // Update mouse position in game state
    setGameState(prev => ({
      ...prev,
      mousePosition: { x, y }
    }));
    
    if (draggingAsset) { 
      draggingAsset.x = x - dragOffset.x; 
      draggingAsset.y = y - dragOffset.y; 
      
      // Check collisions while dragging if the asset has collision
      if (draggingAsset.hasCollision) {
        checkCollisions(assetsRef.current);
      }
      
      forceRedrawAssets(); 
      return; 
    }
    
    if (isResizing && resizeAsset) {
      const newWidth = Math.max(32, initialSize.width + (x - resizeStartPos.x));
      const newHeight = Math.max(32, initialSize.height + (y - resizeStartPos.y));
      setCursorStyle('nwse-resize');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      ctx.fillStyle = '#e0e0e0'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      assets.forEach(asset => {
        const img = assetImages[asset.imgSrc];
        if (img) {
          // Apply opacity if defined, otherwise use 1 (fully opaque)
          const opacity = asset.opacity !== undefined ? asset.opacity : 1;
          
          // Save the current context state
          ctx.save();
          
          // Set global alpha (opacity)
          ctx.globalAlpha = opacity;
          
          if (asset.canvasId === resizeAsset.canvasId) {
            ctx.drawImage(img, asset.x, asset.y, newWidth, newHeight);
            ctx.strokeStyle = '#64ffda'; 
            ctx.lineWidth = 3; 
            ctx.strokeRect(asset.x - 4, asset.y - 4, newWidth + 8, newHeight + 8);
            
            // Draw collision indicator if enabled
            if (asset.hasCollision) {
              ctx.strokeStyle = '#ff0000'; // Red border for collision-enabled assets
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 3]); // Dashed line
              ctx.strokeRect(asset.x, asset.y, newWidth, newHeight);
              ctx.setLineDash([]); // Reset dash
            }
            
            // Draw win collision indicator if asset has winCollision enabled
            if (asset.isWinObject) {
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 3]);
              ctx.strokeRect(asset.x - 2, asset.y - 2, newWidth + 4, newHeight + 4);
              ctx.setLineDash([]);
            }
            
            const handleSize = 10;
            ctx.fillStyle = '#64ffda'; 
            ctx.fillRect(asset.x + newWidth - handleSize/2, asset.y + newHeight - handleSize/2, handleSize, handleSize);
          } else {
            ctx.drawImage(img, asset.x, asset.y, asset.width, asset.height);
            
            // Draw collision indicator for other assets
            if (asset.hasCollision) {
              ctx.strokeStyle = '#ff0000'; // Red border for collision-enabled assets
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 3]); // Dashed line
              ctx.strokeRect(asset.x, asset.y, asset.width, asset.height);
              ctx.setLineDash([]); // Reset dash
            }
            
            // Draw win collision indicator for other assets
            if (asset.isWinObject) {
              ctx.strokeStyle = '#00ff00'; // Green border for win-collision-enabled assets
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 3]); // Dashed line
              ctx.strokeRect(asset.x - 2, asset.y - 2, asset.width + 4, asset.height + 4);
              ctx.setLineDash([]);
            }
            
            if (asset.canvasId === selectedAssetId && asset.canvasId !== resizeAsset.canvasId) {
              ctx.strokeStyle = '#64ffda'; 
              ctx.lineWidth = 3; 
              ctx.strokeRect(asset.x - 4, asset.y - 4, asset.width + 8, asset.height + 8);
              const handleSize = 10; 
              ctx.fillStyle = '#64ffda'; 
              ctx.fillRect(asset.x + asset.width - handleSize/2, asset.y + asset.height - handleSize/2, handleSize, handleSize);
            }
          }
          
          // Restore the context to its original state
          ctx.restore();
        }
      });
      return;
    }
    
    if (isPlaying) { 
      setCursorStyle('default'); 
      return; 
    }
    
    const selectedAsset = assets.find(asset => asset.canvasId === selectedAssetId);
    if (selectedAsset && isOverResizeHandle(x, y, selectedAsset)) { 
      setCursorStyle('nwse-resize'); 
    }
    else { 
      setCursorStyle('default'); 
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPlaying) {
        // Handle onClick actions - only for assets that were directly clicked
        const clickedAsset = assets.find(asset => asset.containsPoint(x, y));
        if (clickedAsset) {
            clickedAsset.actions?.forEach(action => {
                if (action.type === 'onClick') {
                    action.execute(clickedAsset, gameStateRef.current);
                }
            });
        }
        
        // Execute mouseDown actions for ALL assets (when anywhere in canvas is clicked)
        assets.forEach(asset => {
            asset.actions?.forEach(action => {
                if (action.type === 'mouseDown') {
                    action.execute(asset, gameStateRef.current);
                }
            });
        });
        
        // Check for collisions after actions
        checkCollisions(assetsRef.current);
        
        if (typeof onAttemptSelectWhilePlaying === 'function') {
            onAttemptSelectWhilePlaying();
        }
        return;
    }

    const selectedAsset = assets.find(asset => asset.canvasId === selectedAssetId);
    if (selectedAsset && isOverResizeHandle(x, y, selectedAsset)) {
      setIsResizing(true);
      setResizeStartPos({ x, y });
      setResizeAsset(selectedAsset);
      setInitialSize({ width: selectedAsset.width, height: selectedAsset.height });
      setCursorStyle('nwse-resize');
      return;
    }

    if (!isPlaying) {
      for (let i = assets.length - 1; i >= 0; i--) {
        const asset = assets[i];
        if (asset.containsPoint(x, y)) {
          onAssetSelected(asset.canvasId);
          setDraggingAsset(asset);
          setDragOffset({ x: x - asset.x, y: y - asset.y });
          return;
        }
      }
    }

    onAssetSelected(null);
  };

  const handleMouseUp = (e) => {
    if (isResizing && resizeAsset) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newWidth = Math.max(32, initialSize.width + (x - resizeStartPos.x));
      const newHeight = Math.max(32, initialSize.height + (y - resizeStartPos.y));
      if (typeof onAssetResized === 'function') { 
        onAssetResized(resizeAsset.canvasId, newWidth, newHeight); 
      }
      
      // Check for collisions after resizing if asset has collision enabled
      if (resizeAsset.hasCollision) {
        checkCollisions(assetsRef.current);
      }
    }
    
    if (draggingAsset) { 
      // Check for collisions after dragging if asset has collision enabled
      if (draggingAsset.hasCollision) {
        checkCollisions(assetsRef.current);
      }
      setDraggingAsset(null); 
      setDragOffset({ x: 0, y: 0 }); 
    }

    setIsResizing(false);
    setResizeAsset(null);
    setCursorStyle('default');
  };

  const handleMouseOut = () => {
    if (isResizing) { 
      setIsResizing(false); 
      setResizeAsset(null); 
      setCursorStyle('default'); 
      forceRedrawAssets(); 
    }
  };

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
    const assetData = e.dataTransfer.getData('application/json');
    if (!assetData) return;
    
    try {
      const assetTemplate = JSON.parse(assetData);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newAsset = new Asset({ 
        ...assetTemplate, 
        canvasId: `canvas-${Date.now()}`, 
        x: x - (assetTemplate.width / 2), 
        y: y - (assetTemplate.height / 2), 
        actions: [] 
      });
      
      const ensureImageLoaded = () => {
        if (assetImages[newAsset.imgSrc]) { 
          onAssetDraggedToCanvas(newAsset); 
          forceRedrawAssets(); 
        }
        else {
          const img = new Image();
          img.src = newAsset.imgSrc;
          img.onload = () => { 
            setAssetImages(prev => ({ ...prev, [newAsset.imgSrc]: img })); 
            onAssetDraggedToCanvas(newAsset); 
            forceRedrawAssets(); 
          };
          img.onerror = () => { 
            console.error('Failed to load image:', newAsset.imgSrc); 
            onAssetDraggedToCanvas(newAsset); 
          };
        }
      };
      
      ensureImageLoaded();
    } catch (error) { 
      console.error('Error adding asset to canvas:', error); 
    }
  };

  const handlePlayToggle = () => {
    // Clear all key states when toggling play state
    if (isPlaying) {
      setGameState(prev => ({
        ...prev,
        keyState: {}
      }));
    }
    
    onPlayToggle();
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef} width={800} height={500}
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
        className={`play-button ${isPlaying ? 'playing-state' : 'paused-state'}`}
        onClick={handlePlayToggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      {selectedAssetId && !isPlaying && (
        <button className="delete-button" onClick={handleDeleteAsset} aria-label="Delete selected asset" title="Delete selected asset">
          🗑️
        </button>
      )}
    </div>
  );
}

export default Canvas;