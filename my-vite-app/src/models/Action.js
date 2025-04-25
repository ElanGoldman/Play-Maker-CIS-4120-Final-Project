class Action {
  constructor(options = {}) {
    this.id = options.id || `action-${Date.now()}`;
    this.type = options.type || ''; // e.x. 'spacePress'
    this.behavior = options.behavior || ''; // e.x. 'jump'
    this.parameters = options.parameters || {}; 
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.isRunning = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    return this;
  }

  setParameters(params) {
    this.parameters = { ...this.parameters, ...params };
    return this;
  }

  // Execute the action
  execute(asset, gameState) {
    console.log(`Executing ${this.type} -> ${this.behavior} on asset ${asset.name}`);
    
    if (!this.enabled) return false;
    
    if (this.isRunning && (this.behavior === 'jump')) return false;
    
    // Have all behaviors in switch statement
    // TODO: make sure to add or remove more functionality for the actions
    switch (this.behavior) {
      case 'jump':
        // Set flag to prevent starting multiple jumps simultaneously
        this.isRunning = true;
        
        const height = this.parameters.height || 50;
        const duration = this.parameters.duration || 2000;
        
        const originalY = asset.y;
        const startTime = Date.now(); //timed jump
        
        // Create animation function
        const animate = () => {
          const currentTime = Date.now();
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const jumpOffset = Math.sin(Math.PI * progress) * height;
          
          asset.y = originalY - jumpOffset;
          
          // Continue animation if not done
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Reset position and flag when done
            asset.y = originalY;
            this.isRunning = false;
          }
        };
        
        // Start the animation
        requestAnimationFrame(animate);
        return true;
        
      case 'move':
        asset.x += this.parameters.x || 0;
        asset.y += this.parameters.y || 0;
        return true;
        
      case 'moveUp':
        asset.y -= this.parameters.distance || 10;
        return true;
        
      case 'moveDown':
        asset.y += this.parameters.distance || 10;
        return true;
        
      case 'moveLeft':
        asset.x -= this.parameters.distance || 10;
        return true;
        
      case 'moveRight':
        asset.x += this.parameters.distance || 10;
        return true;
        
      case 'setPosition':
        asset.x = this.parameters.x !== undefined ? this.parameters.x : asset.x;
        asset.y = this.parameters.y !== undefined ? this.parameters.y : asset.y;
        return true;
        
      case 'changeSize':
        const scale = this.parameters.scale || 1;
        asset.width = asset.width * scale;
        asset.height = asset.height * scale;
        return true;
        
      case 'setVector':
        asset.velocityX = this.parameters.x || 0;
        asset.velocityY = this.parameters.y || 0;
        return true;
        
      default:
        console.warn(`Unknown behavior: ${this.behavior}`);
        return false;
    }
  }

  // Create a copy of this action
  clone() {
    return new Action({
      ...this,
      id: `action-${Date.now()}`, // Generate a new ID
      parameters: { ...this.parameters } // Clone the parameters object
    });
  }

  // Convert to a simple object for serialization
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      behavior: this.behavior,
      parameters: this.parameters,
      enabled: this.enabled
    };
  }

  // Create an Action instance from a serialized object
  static fromJSON(json) {
    return new Action(json);
  }
}

export default Action;