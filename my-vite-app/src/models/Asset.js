class Asset {
  constructor(options = {}) {
    // IDs are strings, not numbers, for better/consistent comparison
    this.id = options.id ? String(options.id) : `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.canvasId = options.canvasId || `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = options.type || 'sprite';
    this.name = options.name || 'Untitled Asset';
    this.imgSrc = options.imgSrc || '';
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 32;
    this.height = options.height || 32;
    this.actions = options.actions || [];
    this.properties = options.properties || {};
    
    // Original dimensions - useful for scaling operations
    this.originalWidth = options.originalWidth || options.width || 32;
    this.originalHeight = options.originalHeight || options.height || 32;
    
    // Animation properties
    this.velocityX = 0;
    this.velocityY = 0;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.isAnimating = false;
    
    // Resizing state
    this.isResizing = false;
  }

  // Add a new action to this asset
  addAction(action) {
    this.actions.push(action);
    return this;
  }

  // Remove an action by ID
  removeAction(actionId) {
    this.actions = this.actions.filter(action => action.id !== actionId);
    return this;
  }

  // Check if a point is inside this asset
  containsPoint(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
  
  // Check if a point is over the resize handle
  isPointOverResizeHandle(x, y) {
    const handleSize = 10;
    const handleX = this.x + this.width - handleSize/2;
    const handleY = this.y + this.height - handleSize/2;
    
    return (
      x >= handleX && x <= handleX + handleSize &&
      y >= handleY && y <= handleY + handleSize
    );
  }
  
  // Resize the asset
  resize(newWidth, newHeight) {
    // Ensure minimum size
    this.width = Math.max(16, newWidth);
    this.height = Math.max(16, newHeight);
    return this;
  }
  
  // Resize with aspect ratio preserved
  resizeKeepAspect(newWidth, newHeight) {
    const aspectRatio = this.originalWidth / this.originalHeight;
    
    if (newWidth / newHeight > aspectRatio) {
      // Width is too large for the height
      this.width = newHeight * aspectRatio;
      this.height = newHeight;
    } else {
      // Height is too large for the width
      this.width = newWidth;
      this.height = newWidth / aspectRatio;
    }
    
    return this;
  }
  
  // Handle animation update
  update(deltaTime) {
    // Update velocity based on acceleration
    this.velocityX += this.accelerationX * deltaTime;
    this.velocityY += this.accelerationY * deltaTime;
    
    // Update position based on velocity
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    return this;
  }
  
  // Process an action trigger
  processActionTrigger(triggerType, gameState) {
    let actionExecuted = false;
    
    // Find and execute all matching actions
    if (this.actions && Array.isArray(this.actions)) {
      this.actions.forEach(action => {
        if (action.type === triggerType && action.enabled) {
          if (action.execute(this, gameState)) {
            actionExecuted = true;
          }
        }
      });
    }
    
    return actionExecuted;
  }

  // Create a copy of this asset
  clone() {
    return new Asset({
      ...this,
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      canvasId: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      actions: [...this.actions], // Clone the actions array
      properties: {...this.properties}, // Clone the properties object
      originalWidth: this.originalWidth,
      originalHeight: this.originalHeight
    });
  }

  // Convert to a simple object for serialization
  toJSON() {
    return {
      id: this.id,
      canvasId: this.canvasId,
      type: this.type,
      name: this.name,
      imgSrc: this.imgSrc,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      originalWidth: this.originalWidth,
      originalHeight: this.originalHeight,
      actions: this.actions,
      properties: this.properties
    };
  }

  // Create an Asset instance from a serialized object
  static fromJSON(json) {
    return new Asset(json);
  }
}

export default Asset;