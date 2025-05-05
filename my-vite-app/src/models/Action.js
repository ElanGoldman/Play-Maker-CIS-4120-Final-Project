class Action {
  constructor(options = {}) {
    this.id = options.id || `action-${Date.now()}`;
    this.type = options.type || ''; // e.x. 'spacePress'
    this.behavior = options.behavior || ''; // e.x. 'jump', 'setVector', etc.
    this.parameters = options.parameters || {}; 
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.isRunning = false;
    this.animationFrameId = null; // Store animation frame ID for cancellation
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
    if (!this.enabled) return false;
    
    // For animations, prevent starting multiple instances simultaneously
    if (this.isRunning && (this.behavior === 'jump' || this.behavior === 'fadeIn')) return false;
    
    // Handle all behaviors in switch statement
    switch (this.behavior) {
      case 'jump': {
        if (!asset.hasGravity) {
            // Set flag to prevent starting multiple jumps simultaneously
          this.isRunning = true;
          
          const height = this.parameters.height || 50;
          const duration = this.parameters.duration || 2000;
          
          const jumpOriginalY = asset.y;
          const startTime = Date.now();
          
          // Create animation function
          const animate = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const jumpOffset = Math.sin(Math.PI * progress) * height;
            
            // Store original Y position
            const originalY = asset.y;
            
            // Calculate new position
            const newY = jumpOriginalY - jumpOffset;
            
            // Only move if we're not colliding
            if (!asset.hasCollision || !asset.isCollidingAbove) {
              asset.y = newY;
            } else {
              // If collision happened in upward direction, reset jump
              if (newY < originalY) {
                this.isRunning = false;
                this.animationFrameId = null;
                return;
              }
            }
            
            asset.isAnimating = true;
            
            // Continue animation if not done
            if (progress < 1) {
              this.animationFrameId = requestAnimationFrame(animate);
            } else {
              // Reset position and flag when done
              asset.y = jumpOriginalY;
              this.isRunning = false;
              this.animationFrameId = null;
              asset.isAnimating = false;
            }
          };
          
          // Start the animation
          this.animationFrameId = requestAnimationFrame(animate);
          return true;
        }
        if (asset.hasGravity && asset.canJump) {
          asset.velocityY = -10;
          asset.canJump = false;
        } 
        return true;
      }
        
      case 'move':
        const moveX = this.parameters.x || 0;
        const moveY = this.parameters.y || 0;
        
        const origX = asset.x;
        const origY = asset.y;
        
        asset.x += moveX;
        asset.y += moveY;
        
        // If asset has collision, check if the move is valid
        if (asset.hasCollision && (asset.isColliding || asset.isCollidingWithCanvas)) {
          // If collision, revert to original position
          asset.x = origX;
          asset.y = origY;
        }
        
        return true;
        
      case 'teleport':
        // Get the mouse position from gameState
        if (gameState && gameState.mousePosition) {
          // Teleport the asset to the mouse position, centering it on the mouse
          asset.x = gameState.mousePosition.x - (asset.width / 2);
          asset.y = gameState.mousePosition.y - (asset.height / 2);
          return true;
        }
        return false;
        
      case 'moveUp':
        if (!asset.hasCollision || !asset.isCollidingAbove) {
          asset.y -= this.parameters.distance || 10;
        }
        return true;
        
      case 'moveDown':
        if (!asset.hasCollision || !asset.isCollidingBelow) {
          asset.y += this.parameters.distance || 10;
        }
        return true;
        
      case 'moveLeft':
        if (!asset.hasCollision || !asset.isCollidingLeft) {
          asset.x -= this.parameters.distance || 10;
        }
        return true;
        
      case 'moveRight':
        if (!asset.hasCollision || !asset.isCollidingRight) {
          asset.x += this.parameters.distance || 10;
        }
        return true;
        
      case 'setPosition':
        const originalX = asset.x;
        const originalY = asset.y;
        
        asset.x = this.parameters.x !== undefined ? this.parameters.x : asset.x;
        asset.y = this.parameters.y !== undefined ? this.parameters.y : asset.y;
        
        // If asset has collision and is now colliding, revert
        if (asset.hasCollision && (asset.isColliding || asset.isCollidingWithCanvas)) {
          asset.x = originalX;
          asset.y = originalY;
        }
        
        return true;
        
      case 'changeSize': {
        const scale = this.parameters.scale || 1;
        asset.width = asset.width * scale;
        asset.height = asset.height * scale;
        return true;
      }

      case 'setVector': {
        
        // Set velocity based on parameters
        if (this.parameters.x !== undefined) {
          asset.velocityX = this.parameters.x || 0;
        }
        if (this.parameters.y !== undefined) {
          asset.velocityY = this.parameters.y || 0;
        }
        
        
        return true;
      }
        
      case 'fadeIn': {
        // Set flag to prevent starting multiple fade animations simultaneously
        this.isRunning = true;
        
        const fadeDuration = this.parameters.duration || 1000;
        const fadeStartTime = Date.now();
        
        // Store original opacity if not already set
        if (asset.opacity === undefined) {
          asset.opacity = 0;
        } else {
          // Start from current opacity
          asset.opacity = 0;
        }
        
        // Create animation function for fade in
        const animateFade = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - fadeStartTime;
          const fadeProgress = Math.min(elapsed / fadeDuration, 1);
          
          asset.opacity = fadeProgress;
          
          if (fadeProgress < 1) {
            this.animationFrameId = requestAnimationFrame(animateFade);
          } else {
            // Set final opacity and flag when done
            asset.opacity = 1;
            this.isRunning = false;
            this.animationFrameId = null;
          }
        };
        
        // Start the fade animation
        this.animationFrameId = requestAnimationFrame(animateFade);
        return true;
      }
        
      case 'enableCollision':
        // Enable collision detection for the asset
        console.log(`Enabling collision for ${asset.name}`);
        asset.hasCollision = true;
        return true;
      
      case 'winCollision':
        // Enable both collision detection and win state for the asset
        console.log(`Enabling win collision for ${asset.name}`);
        asset.hasCollision = true;
        asset.isWinObject = true;
        return true;

        case 'enableGravity':
          // Enable gravity for the asset
          console.log(`Enabling gravity for ${asset.name}`);
          asset.hasGravity = true;
          return true;
                
      default:
        console.warn(`Unknown behavior: ${this.behavior}`);
        return false;
    }
  }

  // Stop any running animations
  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.isRunning = false;
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