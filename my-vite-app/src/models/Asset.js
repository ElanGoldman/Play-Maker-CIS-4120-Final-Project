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

    // Visual properties
    this.opacity = options.opacity !== undefined ? options.opacity : 1; // Default to fully opaque
    
    // Collision properties
    this.hasCollision = options.hasCollision !== undefined ? options.hasCollision : false;
    this.collidingWith = new Set(); // Track which assets this is colliding with
    
    // Directional collision flags
    this.isCollidingAbove = false;
    this.isCollidingBelow = false;
    this.isCollidingLeft = false;
    this.isCollidingRight = false;
    this.isCollidingWithCanvas = false;

    //allow another jump
    this.canJump = true;
    this.hasGravity = options.hasGravity !== undefined ? options.hasGravity : false;
    this.accelerationY += this.hasGravity ? 1 : 0; // Gravity effect
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

  // Set opacity
  setOpacity(value) {
    this.opacity = Math.max(0, Math.min(1, value)); // Ensure value is between 0 and 1
    return this;
  }
  
  // Fade in over time
  fadeIn(duration = 5000, callback) {
    this.opacity = 0;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.opacity = 1;
        if (typeof callback === 'function') {
          callback();
        }
      }
    }
  }
  
  // Check if this asset is colliding with another asset
  isCollidingWith(otherAsset) {
    return (
      this.x < otherAsset.x + otherAsset.width &&
      this.x + this.width > otherAsset.x &&
      this.y < otherAsset.y + otherAsset.height &&
      this.y + this.height > otherAsset.y
    );
  }
  
  // Determine the side of collision with another asset
  getCollisionSide(otherAsset) {
    const thisCenter = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
    
    const otherCenter = {
      x: otherAsset.x + otherAsset.width / 2,
      y: otherAsset.y + otherAsset.height / 2
    };
    
    // Calculate overlap
    const overlapX = (this.width / 2 + otherAsset.width / 2) - Math.abs(thisCenter.x - otherCenter.x);
    const overlapY = (this.height / 2 + otherAsset.height / 2) - Math.abs(thisCenter.y - otherCenter.y);
    
    // Determine collision side based on smallest overlap and centers
    if (overlapX < overlapY) {
      // Horizontal collision (left or right)
      return thisCenter.x < otherCenter.x ? 'right' : 'left';
    } else {
      // Vertical collision (top or bottom)
      return thisCenter.y < otherCenter.y ? 'bottom' : 'top';
    }
  }
  
  // Check collision with canvas boundaries
  checkCanvasBoundary(canvasWidth, canvasHeight) {
    const isColliding = (
      this.x < 0 ||
      this.y < 0 ||
      this.x + this.width > canvasWidth ||
      this.y + this.height > canvasHeight
    );
    
    this.isCollidingWithCanvas = isColliding;
    
    // Set directional flags for canvas collision
    this.isCollidingLeft = this.x < 0;
    this.isCollidingRight = this.x + this.width > canvasWidth;
    this.isCollidingAbove = this.y < 0;
    this.isCollidingBelow = this.y + this.height > canvasHeight;
    
    return isColliding;
  }
  
  // Update directional collision flags based on collisions with other assets
  updateDirectionalCollisionFlags(otherAssets) {
    // Reset directional flags first
    this.isCollidingAbove = false;
    this.isCollidingBelow = false;
    this.isCollidingLeft = false;
    this.isCollidingRight = false;
    
    // Only check if collision is enabled
    if (!this.hasCollision) return;
    
    // Check against all other assets with collision enabled
    otherAssets.forEach(otherAsset => {
      if (otherAsset.canvasId === this.canvasId || !otherAsset.hasCollision) return;
      
      if (this.isCollidingWith(otherAsset)) {
        // Determine the side of collision
        const side = this.getCollisionSide(otherAsset);
        
        // Update directional flags
        switch (side) {
          case 'top':
            this.isCollidingAbove = true;
            break;
          case 'bottom':
            this.isCollidingBelow = true;
            break;
          case 'left':
            this.isCollidingLeft = true;
            break;
          case 'right':
            this.isCollidingRight = true;
            break;
        }
      }
    });
  }
  
  // Compute if this asset is colliding with any other assets
  get isColliding() {
    return this.collidingWith.size > 0;
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
      originalHeight: this.originalHeight,
      hasCollision: this.hasCollision
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
      properties: this.properties,
      hasCollision: this.hasCollision,
      hasGravity: this.hasGravity,
      canJump: this.canJump,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      accelerationX: this.accelerationX,
      accelerationY: this.accelerationY,
    };
  }

  // Create an Asset instance from a serialized object
  static fromJSON(json) {
    return new Asset(json);
  }
}

export default Asset;