import { useState } from 'react';
// import Asset from '../models/Asset';

function AssetPanel({ assets }) {
  const [filter, setFilter] = useState('');
  
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
      
      <button className="import-button">Import Asset</button>
    </div>
  );
}

export default AssetPanel;