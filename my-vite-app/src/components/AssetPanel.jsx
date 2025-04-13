import { useState, useEffect, useRef } from 'react';
import Asset from '../models/Asset';

function AssetPanel({ assets, onAddAsset }) {
  const [filter, setFilter] = useState('');
  const fileInputRef = useRef(null);
  
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  // Draggable
  const handleDragStart = (e, assetTemplate) => {
    const dragAsset = {
      ...assetTemplate,
      width: 32, // Default
      height: 32 // Default
    };
    
    // Set the drag data as a JSON string
    e.dataTransfer.setData('application/json', JSON.stringify(dragAsset));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';
    
    const img = new Image();
    img.src = assetTemplate.imgSrc;
    //pixel art proper rendering
    img.style.imageRendering = 'pixelated';
    
    // Set drag image
    if (img.complete) {
      e.dataTransfer.setDragImage(img, 16, 16);
    } else {
      img.onload = () => {
        e.dataTransfer.setDragImage(img, 16, 16);
      };
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Only process image files
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgSrc = event.target.result;
        
        const img = new Image();
        img.onload = () => {
          const newAsset = new Asset({
            id: `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: 'sprite',
            name: file.name.split('.')[0], // Use filename without extension as asset name
            imgSrc: imgSrc,
            width: 32,
            height: 32,
            originalWidth: img.width,
            originalHeight: img.height
          });
          
          if (typeof onAddAsset === 'function') {
            onAddAsset(newAsset);
          }
        };
        img.src = imgSrc;
      };
      
      // Read the image file as a data URL
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  return (
    <div className="asset-panel">
      <h2>Assets</h2>
      
      <div className="asset-search">
        <input 
          type="text"
          placeholder="Search assets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      <div className="asset-list">
        {filteredAssets.map(asset => (
          <div 
            key={asset.id} 
            className="asset-item"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, asset)}
          >
            <img 
              src={asset.imgSrc} 
              alt={asset.name} 
              style={{ 
                imageRendering: 'pixelated',
                width: '32px',
                height: '32px'
              }}
            />
            <span>{asset.name}</span>
          </div>
        ))}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileSelect}
        multiple
      />
      
      <button className="import-button" onClick={handleImportClick}>
        Import Asset
      </button>
    </div>
  );
}

export default AssetPanel;