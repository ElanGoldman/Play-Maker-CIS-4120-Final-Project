class Action {
  constructor(options = {}) {
    this.id = options.id || `action-${Date.now()}`;
    this.type = options.type || '';
    this.behavior = options.behavior || '';
    this.parameters = options.parameters || {};
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.isRunning = false;
    this.animationFrameId = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    return this;
  }

  setParameters(params) {
    this.parameters = { ...this.parameters, ...params };
    return this;
  }

  execute(asset, gameState) {
    if (!this.enabled) return false;
    if (this.isRunning && (this.behavior === 'jump' || this.behavior === 'fadeIn')) return false;

    switch (this.behavior) {
      case 'jump': {
        if (!asset.hasGravity) {
          this.isRunning = true;
          const height = this.parameters.height || 50;
          const duration = this.parameters.duration || 2000;
          const jumpOriginalY = asset.y;
          const startTime = Date.now();
          const animate = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const jumpOffset = Math.sin(Math.PI * progress) * height;
            const originalY = asset.y;
            const newY = jumpOriginalY - jumpOffset;
            if (!asset.hasCollision || !asset.isCollidingAbove) {
              asset.y = newY;
            } else {
              if (newY < originalY) {
                this.isRunning = false;
                this.animationFrameId = null;
                return;
              }
            }
            asset.isAnimating = true;
            if (progress < 1) {
              this.animationFrameId = requestAnimationFrame(animate);
            } else {
              asset.y = jumpOriginalY;
              this.isRunning = false;
              this.animationFrameId = null;
              asset.isAnimating = false;
            }
          };
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
        if (asset.hasCollision && (asset.isColliding || asset.isCollidingWithCanvas)) {
          asset.x = origX;
          asset.y = origY;
        }
        return true;

      case 'teleport':
        if (gameState && gameState.mousePosition) {
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
        if (this.parameters.x !== undefined) {
          asset.velocityX = this.parameters.x || 0;
        }
        if (this.parameters.y !== undefined) {
          asset.velocityY = this.parameters.y || 0;
        }
        return true;
      }

      case 'fadeIn': {
        this.isRunning = true;
        const fadeDuration = this.parameters.duration || 1000;
        const fadeStartTime = Date.now();
        if (asset.opacity === undefined) {
          asset.opacity = 0;
        } else {
          asset.opacity = 0;
        }
        const animateFade = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - fadeStartTime;
          const fadeProgress = Math.min(elapsed / fadeDuration, 1);
          asset.opacity = fadeProgress;
          if (fadeProgress < 1) {
            this.animationFrameId = requestAnimationFrame(animateFade);
          } else {
            asset.opacity = 1;
            this.isRunning = false;
            this.animationFrameId = null;
          }
        };
        this.animationFrameId = requestAnimationFrame(animateFade);
        return true;
      }

      case 'enableCollision':
        console.log(`Enabling collision for ${asset.name}`);
        asset.hasCollision = true;
        return true;

      case 'winCollision':
        console.log(`Enabling win collision for ${asset.name}`);
        asset.hasCollision = true;
        asset.isWinObject = true;
        return true;

      case 'enableGravity':
        console.log(`Enabling gravity for ${asset.name}`);
        asset.hasGravity = true;
        return true;

      case 'setStatic':
        console.log(`Setting asset ${asset.name} to static`);
        asset.isStatic = true;
        return true;

      default:
        console.warn(`Unknown behavior: ${this.behavior}`);
        return false;
    }
  }

  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isRunning = false;
  }

  clone() {
    return new Action({
      ...this,
      id: `action-${Date.now()}`,
      parameters: { ...this.parameters }
    });
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      behavior: this.behavior,
      parameters: this.parameters,
      enabled: this.enabled
    };
  }

  static fromJSON(json) {
    return new Action(json);
  }
}

export default Action;