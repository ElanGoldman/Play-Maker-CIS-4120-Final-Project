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

        if (asset.hasCollision) {
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(asset.x, asset.y, asset.width, asset.height);
          ctx.setLineDash([]);
        }

        if (asset.isWinObject) {
          ctx.strokeStyle = '#00ff00';
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

  const checkCollisions = (currentAssets) => {
    let positions = {};
    let positionsChanged = false;
    let winCollisionDetected = false;

    currentAssets.forEach(asset => {
      asset.collidingWith = new Set();
      positions[asset.canvasId] = { x: asset.x, y: asset.y };
    });

    for (let i = 0; i < currentAssets.length; i++) {
      const assetA = currentAssets[i];

      if (!assetA.hasCollision) continue;

      for (let j = i + 1; j < currentAssets.length; j++) {
        const assetB = currentAssets[j];
        if (!assetB.hasCollision) continue;

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

          resolveCollision(assetA, assetB);
          positionsChanged = true;
        }
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      currentAssets.forEach(asset => {
        if (asset.hasCollision && !asset.isStatic) {
          const oldX = asset.x;
          const oldY = asset.y;

          const bound = (value, min, max) => Math.max(min, Math.min(value, max));
          asset.x = bound(asset.x, 0, canvas.width - asset.width);
          asset.y = bound(asset.y, 0, canvas.height - asset.height);

          if (oldX !== asset.x || oldY !== asset.y) {
            positionsChanged = true;
          }

          if (asset.y === canvas.height - asset.height) {
            if (asset.velocityY > 0){
              asset.velocityY = 0;
            }
            asset.canJump = true;
          }
        }
      });
    }

    previousPositionsRef.current = positions;

    if (winCollisionDetected) {
      console.log("Win collision detected! NOTIFY FUNCTION");
      handleWinNotification();
    }

    if (positionsChanged && typeof onAssetsUpdated === 'function') {
      onAssetsUpdated(currentAssets);
    }

    return currentAssets;
  };

  const isCollidingWithCurrentSize = (assetA, assetB) => {
    return (
      assetA.x < assetB.x + assetB.width &&
      assetA.x + assetA.width > assetB.x &&
      assetA.y < assetB.y + assetB.height &&
      assetA.y + assetA.height > assetB.y
    );
  };

  const resolveCollision = (assetA, assetB) => {
    if (assetA.isStatic && assetB.isStatic) {
      return;
    }

    const centerA = {
      x: assetA.x + assetA.width / 2,
      y: assetA.y + assetA.height / 2
    };

    const centerB = {
      x: assetB.x + assetB.width / 2,
      y: assetB.y + assetB.height / 2
    };

    const overlapX = (assetA.width / 2 + assetB.width / 2) - Math.abs(centerA.x - centerB.x);
    const overlapY = (assetA.height / 2 + assetB.height / 2) - Math.abs(centerA.y - centerB.y);

    if (overlapX < overlapY) {
      const moveAmount = overlapX;
      if (centerA.x < centerB.x) {
        if (assetA.isStatic) {
          assetB.x += moveAmount;
        } else if (assetB.isStatic) {
          assetA.x -= moveAmount;
        } else {
          assetA.x -= moveAmount / 2;
          assetB.x += moveAmount / 2;
        }
        if (assetA.velocityX > 0) assetA.velocityX = 0;
        if (assetB.velocityX < 0) assetB.velocityX = 0;
      } else {
         if (assetA.isStatic) {
          assetB.x -= moveAmount;
        } else if (assetB.isStatic) {
          assetA.x += moveAmount;
        } else {
          assetA.x += moveAmount / 2;
          assetB.x -= moveAmount / 2;
        }
        if (assetA.velocityX < 0) assetA.velocityX = 0;
        if (assetB.velocityX > 0) assetB.velocityX = 0;
      }
    } else {
      const moveAmount = overlapY;
      if (centerA.y < centerB.y) {
        if (assetA.isStatic) {
          assetB.y += moveAmount;
          if(assetB.hasGravity) assetB.canJump = true;
        } else if (assetB.isStatic) {
          assetA.y -= moveAmount;
          if(assetA.hasGravity) assetA.canJump = true;
        } else {
          assetA.y -= moveAmount / 2;
          assetB.y += moveAmount / 2;
           if(assetA.hasGravity) assetA.canJump = true;
        }
        if (assetA.velocityY > 0) assetA.velocityY = 0;
        if (assetB.velocityY < 0) assetB.velocityY = 0;
      } else {
        if (assetA.isStatic) {
          assetB.y -= moveAmount;
           if(assetB.hasGravity) assetB.canJump = true;
        } else if (assetB.isStatic) {
          assetA.y += moveAmount;
           if(assetA.hasGravity) assetA.canJump = true;
        } else {
          assetA.y += moveAmount / 2;
          assetB.y -= moveAmount / 2;
           if(assetB.hasGravity) assetB.canJump = true;
        }
         if (assetA.velocityY < 0) assetA.velocityY = 0;
         if (assetB.velocityY > 0) assetB.velocityY = 0;
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
        const bound = (value, min, max) => Math.max(min, Math.min(value, max));
        if (!assetA.isStatic) {
            assetA.x = bound(assetA.x, 0, canvas.width - assetA.width);
            assetA.y = bound(assetA.y, 0, canvas.height - assetA.height);
        }
        if (!assetB.isStatic) {
            assetB.x = bound(assetB.x, 0, canvas.width - assetB.width);
            assetB.y = bound(assetB.y, 0, canvas.height - assetB.height);
        }
    }
  };

  const processSingleAssetMovement = (asset, deltaX, deltaY) => {
    if (!asset || asset.isStatic) return false;

    const originalX = asset.x;
    const originalY = asset.y;

    asset.x += deltaX;
    asset.y += deltaY;

    const canvas = canvasRef.current;
    if (canvas) {
      const bound = (value, min, max) => Math.max(min, Math.min(value, max));
      asset.x = bound(asset.x, 0, canvas.width - asset.width);
      asset.y = bound(asset.y, 0, canvas.height - asset.height);
    }

    let collisionOccurred = false;

    if (asset.hasCollision) {
      assetsRef.current.forEach(otherAsset => {
        if (otherAsset.canvasId === asset.canvasId || !otherAsset.hasCollision) return;

        if (isCollidingWithCurrentSize(asset, otherAsset)) {
          collisionOccurred = true;
          asset.collidingWith.add(otherAsset.canvasId);
          otherAsset.collidingWith.add(asset.canvasId);

          if ((asset.isWinObject || otherAsset.isWinObject) && isPlaying) {
            console.log("Win collision detected during movement!", {
              asset: asset.name,
              otherAsset: otherAsset.name,
              isAssetWinObject: asset.isWinObject,
              isOtherWinObject: otherAsset.isWinObject
            });

            handleWinNotification();
          }

          resolveCollision(asset, otherAsset);
        }
      });
    }

    return true;
  };

  const processKeyActions = () => {
    if (!isPlaying) {
      return;
    }

    const keyActionMap = {
      'Space': 'spacePress',
      'ArrowUp': 'keyPress',
      'ArrowDown': 'keyPressDown',
      'ArrowLeft': 'keyPressLeft',
      'ArrowRight': 'keyPressRight'
    };

    Object.entries(gameStateRef.current.keyState).forEach(([keyCode, isPressed]) => {
      if (isPressed) {
        const actionType = keyActionMap[keyCode];

        if (actionType) {
          assetsRef.current.forEach(asset => {
            if (!asset.actions || asset.actions.length === 0 || asset.isStatic) return;

            const originalX = asset.x;
            const originalY = asset.y;

            asset.actions.forEach(action => {
              if (action.type === actionType && action.enabled) {
                if (action.behavior === 'setVector') {
                  if (action.parameters.x !== undefined || action.parameters.y !== undefined) {
                    const deltaX = action.parameters.x || 0;
                    const deltaY = action.parameters.y || 0;

                    processSingleAssetMovement(asset, deltaX, deltaY);
                  }
                } else {
                  action.execute(asset, gameStateRef.current);
                }
              }
            });

            if (asset.x !== originalX || asset.y !== originalY) {
              const canvas = canvasRef.current;
              if (canvas) {
                const bound = (value, min, max) => Math.max(min, Math.min(value, max));
                asset.x = bound(asset.x, 0, canvas.width - asset.width);
                asset.y = bound(asset.y, 0, canvas.height - asset.height);
              }
            }
          });

          forceRedrawAssets();
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

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      setGameState(prev => {
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

      assetsRef.current.forEach(asset => {
        asset.actions?.forEach(action => {
          if (action.type === 'onStart') {
            action.execute(asset, gameStateRef.current);
          }
        });
      });

      checkCollisions(assetsRef.current);

      let animationFrameId;
      const gameLoop = (timestamp) => {
        const deltaTime = timestamp - gameStateRef.current.lastTimestamp;
        setGameState(prev => ({ ...prev, lastTimestamp: timestamp }));

        processKeyActions();

        let movementOccurred = false;
        assetsRef.current.forEach(asset => {
          if(asset.isStatic) return;

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
    if (asset.isStatic) return false;
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

    setGameState(prev => ({
      ...prev,
      mousePosition: { x, y }
    }));

    if (draggingAsset && !draggingAsset.isStatic) {
      draggingAsset.x = x - dragOffset.x;
      draggingAsset.y = y - dragOffset.y;

      if (draggingAsset.hasCollision) {
        checkCollisions(assetsRef.current);
      }

      forceRedrawAssets();
      return;
    }

    if (isResizing && resizeAsset && !resizeAsset.isStatic) {
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
          const opacity = asset.opacity !== undefined ? asset.opacity : 1;
          ctx.save();
          ctx.globalAlpha = opacity;

          if (asset.canvasId === resizeAsset.canvasId) {
            ctx.drawImage(img, asset.x, asset.y, newWidth, newHeight);
            ctx.strokeStyle = '#64ffda';
            ctx.lineWidth = 3;
            ctx.strokeRect(asset.x - 4, asset.y - 4, newWidth + 8, newHeight + 8);

            if (asset.hasCollision) {
              ctx.strokeStyle = '#ff0000';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 3]);
              ctx.strokeRect(asset.x, asset.y, newWidth, newHeight);
              ctx.setLineDash([]);
            }

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

            if (asset.hasCollision) {
              ctx.strokeStyle = '#ff0000';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 3]);
              ctx.strokeRect(asset.x, asset.y, asset.width, asset.height);
              ctx.setLineDash([]);
            }

            if (asset.isWinObject) {
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 3]);
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
    if (selectedAsset && !selectedAsset.isStatic && isOverResizeHandle(x, y, selectedAsset)) {
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
        const clickedAsset = assets.find(asset => asset.containsPoint(x, y));
        if (clickedAsset) {
            clickedAsset.actions?.forEach(action => {
                if (action.type === 'onClick') {
                    action.execute(clickedAsset, gameStateRef.current);
                }
            });
        }

        assets.forEach(asset => {
            asset.actions?.forEach(action => {
                if (action.type === 'mouseDown') {
                    action.execute(asset, gameStateRef.current);
                }
            });
        });

        checkCollisions(assetsRef.current);

        if (typeof onAttemptSelectWhilePlaying === 'function') {
            onAttemptSelectWhilePlaying();
        }
        return;
    }

    const selectedAsset = assets.find(asset => asset.canvasId === selectedAssetId);
    if (selectedAsset && !selectedAsset.isStatic && isOverResizeHandle(x, y, selectedAsset)) {
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
          if(!asset.isStatic) {
            setDraggingAsset(asset);
            setDragOffset({ x: x - asset.x, y: y - asset.y });
          } else {
             setDraggingAsset(null);
             setDragOffset({ x: 0, y: 0 });
          }
          return;
        }
      }
    }

    onAssetSelected(null);
    setDraggingAsset(null);
    setDragOffset({ x: 0, y: 0 });
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

      if (resizeAsset.hasCollision) {
        checkCollisions(assetsRef.current);
      }
    }

    if (draggingAsset) {
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