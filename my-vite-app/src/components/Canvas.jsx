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
    onAttemptSelectWhilePlaying
}) {

  const canvasRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [assetImages, setAssetImages] = useState({});
  const [gameState, setGameState] = useState({ lastTimestamp: 0, keyState: {} });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeAsset, setResizeAsset] = useState(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [cursorStyle, setCursorStyle] = useState('default');
  const [draggingAsset, setDraggingAsset] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const assetsRef = useRef(assets);

  useEffect(() => { assetsRef.current = assets; }, [assets]);

  useEffect(() => {
    const loadImages = async () => {
      const imageCache = { ...assetImages };
      const newImages = [];
      for (const asset of assets) {
        if (!imageCache[asset.imgSrc]) {
          newImages.push(asset.imgSrc);
          const img = new Image();
          img.src = asset.imgSrc;
          await new Promise((resolve) => { img.onload = () => { imageCache[asset.imgSrc] = img; resolve(); }; img.onerror = () => resolve(); });
        }
      }
      if (newImages.length > 0) { setAssetImages(imageCache); forceRedrawAssets(); }
    };
    loadImages();
  }, [assets]);

  useEffect(() => { setTimeout(forceRedrawAssets, 50); }, [isPlaying, selectedAssetId]);

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
        ctx.drawImage(img, asset.x, asset.y, asset.width, asset.height);
        if (asset.canvasId === selectedAssetId) {
          ctx.strokeStyle = '#64ffda'; ctx.lineWidth = 3;
          ctx.strokeRect( asset.x - 4, asset.y - 4, asset.width + 8, asset.height + 8 );
          const handleSize = 10; ctx.fillStyle = '#64ffda';
          ctx.fillRect( asset.x + asset.width - handleSize/2, asset.y + asset.height - handleSize/2, handleSize, handleSize );
        }
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      setGameState(prev => ({ ...prev, keyState: { ...prev.keyState, [e.code]: true } }));
      if (e.code === 'Space') { e.preventDefault(); assetsRef.current.forEach(asset => { asset.actions?.forEach(action => { if (action.type === 'spacePress') { action.execute(asset, gameState); } }); }); }
      if (e.code === 'ArrowUp') { assetsRef.current.forEach(asset => { asset.actions?.forEach(action => { if (action.type === 'keyPress') { action.execute(asset, gameState); } }); }); }
    };
    const handleKeyUp = (e) => {
      if (!isPlaying) return;
      setGameState(prev => { const newKeyState = { ...prev.keyState }; delete newKeyState[e.code]; return { ...prev, keyState: newKeyState }; });
    };

    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      assetsRef.current.forEach(asset => { asset.actions?.forEach(action => { if (action.type === 'onStart') { action.execute(asset, gameState); } }); });
      let animationFrameId;
      const gameLoop = (timestamp) => {
        const deltaTime = timestamp - gameState.lastTimestamp;
        setGameState(prev => ({ ...prev, lastTimestamp: timestamp }));
        forceRedrawAssets();
        animationFrameId = requestAnimationFrame(gameLoop);
      };
      animationFrameId = requestAnimationFrame(gameLoop);
      return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); cancelAnimationFrame(animationFrameId); };
    }
  }, [isPlaying, gameState.lastTimestamp]);

  useEffect(() => { forceRedrawAssets(); }, [assets, selectedAssetId, assetImages]);

  const isOverResizeHandle = (x, y, asset) => {
    const handleSize = 10;
    const handleX = asset.x + asset.width - handleSize/2;
    const handleY = asset.y + asset.height - handleSize/2;
    return ( x >= handleX && x <= handleX + handleSize && y >= handleY && y <= handleY + handleSize );
  };

  const handleDeleteAsset = () => {
    if (selectedAssetId && typeof onAssetDeleted === 'function') { onAssetDeleted(selectedAssetId); }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    if (draggingAsset) { draggingAsset.x = x - dragOffset.x; draggingAsset.y = y - dragOffset.y; forceRedrawAssets(); return; }
    if (isResizing && resizeAsset) {
      const newWidth = Math.max(32, initialSize.width + (x - resizeStartPos.x));
      const newHeight = Math.max(32, initialSize.height + (y - resizeStartPos.y));
      setCursorStyle('nwse-resize');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#e0e0e0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      assets.forEach(asset => {
        const img = assetImages[asset.imgSrc];
        if (img) {
          if (asset.canvasId === resizeAsset.canvasId) {
            ctx.drawImage(img, asset.x, asset.y, newWidth, newHeight);
            ctx.strokeStyle = '#64ffda'; ctx.lineWidth = 3; ctx.strokeRect(asset.x - 4, asset.y - 4, newWidth + 8, newHeight + 8);
            const handleSize = 10; ctx.fillStyle = '#64ffda'; ctx.fillRect( asset.x + newWidth - handleSize/2, asset.y + newHeight - handleSize/2, handleSize, handleSize );
          } else {
            ctx.drawImage(img, asset.x, asset.y, asset.width, asset.height);
            if (asset.canvasId === selectedAssetId && asset.canvasId !== resizeAsset.canvasId) {
              ctx.strokeStyle = '#64ffda'; ctx.lineWidth = 3; ctx.strokeRect(asset.x - 4, asset.y - 4, asset.width + 8, asset.height + 8);
              const handleSize = 10; ctx.fillStyle = '#64ffda'; ctx.fillRect( asset.x + asset.width - handleSize/2, asset.y + asset.height - handleSize/2, handleSize, handleSize );
            }
          }
        }
      });
      return;
    }
    if (isPlaying) { setCursorStyle('default'); return; }
    const selectedAsset = assets.find(asset => asset.canvasId === selectedAssetId);
    if (selectedAsset && isOverResizeHandle(x, y, selectedAsset)) { setCursorStyle('nwse-resize'); }
    else { setCursorStyle('default'); }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPlaying) {
        const clickedOnAsset = assets.some(asset => asset.containsPoint(x, y));
        if (clickedOnAsset && typeof onAttemptSelectWhilePlaying === 'function') {
            onAttemptSelectWhilePlaying();
        }
        return;
    }

    const selectedAsset = assets.find(asset => asset.canvasId === selectedAssetId);
    if (selectedAsset && isOverResizeHandle(x, y, selectedAsset)) {
      setIsResizing(true); setResizeStartPos({ x, y }); setResizeAsset(selectedAsset);
      setInitialSize({ width: selectedAsset.width, height: selectedAsset.height }); setCursorStyle('nwse-resize');
      return;
    }

    if (!isPlaying) {
      for (let i = assets.length - 1; i >= 0; i--) {
        const asset = assets[i];
        if (asset.containsPoint(x, y)) {
          onAssetSelected(asset.canvasId);
          setDraggingAsset(asset); setDragOffset({ x: x - asset.x, y: y - asset.y });
          return;
        }
      }
    }

    onAssetSelected(null);
  };

  const handleMouseUp = (e) => {
    if (isResizing && resizeAsset) {
      const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      const newWidth = Math.max(32, initialSize.width + (x - resizeStartPos.x));
      const newHeight = Math.max(32, initialSize.height + (y - resizeStartPos.y));
      if (typeof onAssetResized === 'function') { onAssetResized(resizeAsset.canvasId, newWidth, newHeight); }
    }
    if (draggingAsset) { setDraggingAsset(null); setDragOffset({ x: 0, y: 0 }); }

    setIsResizing(false); setResizeAsset(null); setCursorStyle('default');
  };

  const handleMouseOut = () => {
    if (isResizing) { setIsResizing(false); setResizeAsset(null); setCursorStyle('default'); forceRedrawAssets(); }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDragLeave = () => { setIsDraggingOver(false); };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDraggingOver(false);
    const assetData = e.dataTransfer.getData('application/json'); if (!assetData) return;
    try {
      const assetTemplate = JSON.parse(assetData);
      const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      const newAsset = new Asset({ ...assetTemplate, canvasId: `canvas-${Date.now()}`, x: x - (assetTemplate.width / 2), y: y - (assetTemplate.height / 2), actions: [] });
      const ensureImageLoaded = () => {
        if (assetImages[newAsset.imgSrc]) { onAssetDraggedToCanvas(newAsset); forceRedrawAssets(); }
        else {
          const img = new Image(); img.src = newAsset.imgSrc;
          img.onload = () => { setAssetImages(prev => ({ ...prev, [newAsset.imgSrc]: img })); onAssetDraggedToCanvas(newAsset); forceRedrawAssets(); };
          img.onerror = () => { console.error('Failed to load image:', newAsset.imgSrc); onAssetDraggedToCanvas(newAsset); };
        }
      };
      ensureImageLoaded();
    } catch (error) { console.error('Error adding asset to canvas:', error); }
  };

  const handlePlayToggle = () => {
    onPlayToggle();
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef} width={800} height={600}
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