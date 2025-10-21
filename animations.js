/**
 * Animation Manager for Pac-Man Typing Test
 * Handles Canvas-based background animations with Pac-Man characters, ghosts, and dots
 */

class AnimationManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = null;
    this.isRunning = false;
    this.animationId = null;
    
    // Animation entities
    this.pacmanCharacters = [];
    this.ghosts = [];
    this.dots = [];
    this.particles = [];
    
    // Configuration
    this.config = {
      pacmanCount: 4,
      ghostCount: 4,
      dotCount: 50,
      maxParticles: 20,
      gridSize: 40,
      animationSpeed: 1
    };
    
    // Animation state
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    
    // Asset loading
    this.assetsLoaded = false;
    this.sprites = {};
    
    this.init();
  }
  
  async init() {
    try {
      this.setupCanvas();
      await this.loadAssets();
      this.createEntities();
      console.log('Animation Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Animation Manager:', error);
    }
  }
  
  setupCanvas() {
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();
    
    // Set up canvas properties for smooth animations
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }
  
  handleResize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual canvas size
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // Scale canvas back down
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // Scale context for high DPI displays
    this.ctx.scale(dpr, dpr);
    
    // Update dimensions for calculations
    this.width = rect.width;
    this.height = rect.height;
  }
  
  async loadAssets() {
    // Create fallback sprites using Canvas drawing since assets may not exist
    await this.createFallbackSprites();
    this.assetsLoaded = true;
  }
  
  async createFallbackSprites() {
    const spriteSize = 30;
    
    // Create Pac-Man sprites (different colors)
    const pacmanColors = ['#FFE800', '#FF2667', '#0080FF', '#00FF80'];
    this.sprites.pacman = [];
    
    pacmanColors.forEach((color, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = spriteSize;
      canvas.height = spriteSize;
      const ctx = canvas.getContext('2d');
      
      // Draw Pac-Man shape
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(spriteSize/2, spriteSize/2, spriteSize/2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(spriteSize/2, spriteSize/2);
      ctx.closePath();
      ctx.fill();
      
      // Add border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      this.sprites.pacman[index] = canvas;
    });
    
    // Create Ghost sprites
    const ghostColors = ['#FF69B4', '#00FFFF', '#FFA500', '#FF0000'];
    this.sprites.ghost = [];
    
    ghostColors.forEach((color, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = spriteSize;
      canvas.height = spriteSize;
      const ctx = canvas.getContext('2d');
      
      // Draw ghost shape
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(spriteSize/2, spriteSize/2 - 3, spriteSize/2 - 2, Math.PI, 0);
      ctx.lineTo(spriteSize - 2, spriteSize - 5);
      for (let i = 0; i < 3; i++) {
        ctx.lineTo(spriteSize - 2 - (i + 1) * (spriteSize - 4) / 4, spriteSize - 2 - (i % 2) * 3);
      }
      ctx.lineTo(2, spriteSize - 5);
      ctx.closePath();
      ctx.fill();
      
      // Add eyes
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(spriteSize/2 - 6, spriteSize/2 - 3, 4, 0, 2 * Math.PI);
      ctx.arc(spriteSize/2 + 6, spriteSize/2 - 3, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(spriteSize/2 - 6, spriteSize/2 - 3, 2, 0, 2 * Math.PI);
      ctx.arc(spriteSize/2 + 6, spriteSize/2 - 3, 2, 0, 2 * Math.PI);
      ctx.fill();
      
      this.sprites.ghost[index] = canvas;
    });
    
    // Create dot sprite
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 8;
    dotCanvas.height = 8;
    const dotCtx = dotCanvas.getContext('2d');
    
    dotCtx.fillStyle = '#FFE800';
    dotCtx.beginPath();
    dotCtx.arc(4, 4, 3, 0, 2 * Math.PI);
    dotCtx.fill();
    
    this.sprites.dot = dotCanvas;
  }
  
  createEntities() {
    this.createPacmanCharacters();
    this.createGhosts();
    this.createDots();
  }
  
  createPacmanCharacters() {
    const colors = ['yellow', 'red', 'blue', 'green'];
    const speeds = [2, 2.2, 1.8, 2.1];
    
    this.pacmanCharacters = [];
    
    for (let i = 0; i < this.config.pacmanCount; i++) {
      this.pacmanCharacters.push({
        x: Math.random() * (this.width - 60) + 30,
        y: Math.random() * (this.height - 60) + 30,
        vx: (Math.random() - 0.5) * speeds[i],
        vy: (Math.random() - 0.5) * speeds[i],
        color: colors[i],
        colorIndex: i,
        size: 30,
        speed: speeds[i],
        direction: Math.random() * Math.PI * 2,
        mouthAngle: 0,
        mouthSpeed: 0.2,
        targetX: null,
        targetY: null
      });
    }
  }
  
  createGhosts() {
    const colors = ['pink', 'cyan', 'orange', 'red'];
    const speeds = [1.5, 1.6, 1.4, 1.7];
    
    this.ghosts = [];
    
    for (let i = 0; i < this.config.ghostCount; i++) {
      this.ghosts.push({
        x: Math.random() * (this.width - 60) + 30,
        y: Math.random() * (this.height - 60) + 30,
        vx: (Math.random() - 0.5) * speeds[i],
        vy: (Math.random() - 0.5) * speeds[i],
        color: colors[i],
        colorIndex: i,
        size: 28,
        speed: speeds[i],
        direction: Math.random() * Math.PI * 2,
        changeDirectionTimer: 0
      });
    }
  }
  
  createDots() {
    this.dots = [];
    
    for (let i = 0; i < this.config.dotCount; i++) {
      this.addRandomDot();
    }
  }
  
  addRandomDot() {
    this.dots.push({
      x: Math.random() * (this.width - 20) + 10,
      y: Math.random() * (this.height - 20) + 10,
      size: 4,
      eaten: false,
      pulseTime: Math.random() * Math.PI * 2
    });
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.animate();
    console.log('Background animations started');
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('Background animations stopped');
  }
  
  animate() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime >= this.frameInterval) {
      this.update(deltaTime);
      this.render();
      this.lastFrameTime = currentTime;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  update(deltaTime) {
    this.updatePacmanCharacters(deltaTime);
    this.updateGhosts(deltaTime);
    this.updateDots(deltaTime);
    this.updateParticles(deltaTime);
    this.checkCollisions();
  }
  
  updatePacmanCharacters(deltaTime) {
    this.pacmanCharacters.forEach(pacman => {
      // Update mouth animation
      pacman.mouthAngle += pacman.mouthSpeed * deltaTime * 0.01;
      
      // Move Pac-Man
      pacman.x += pacman.vx;
      pacman.y += pacman.vy;
      
      // Bounce off edges
      if (pacman.x < 15 || pacman.x > this.width - 15) {
        pacman.vx *= -1;
        pacman.direction = Math.atan2(pacman.vy, pacman.vx);
      }
      if (pacman.y < 15 || pacman.y > this.height - 15) {
        pacman.vy *= -1;
        pacman.direction = Math.atan2(pacman.vy, pacman.vx);
      }
      
      // Keep in bounds
      pacman.x = Math.max(15, Math.min(this.width - 15, pacman.x));
      pacman.y = Math.max(15, Math.min(this.height - 15, pacman.y));
    });
  }
  
  updateGhosts(deltaTime) {
    this.ghosts.forEach(ghost => {
      // Randomly change direction
      ghost.changeDirectionTimer += deltaTime;
      if (ghost.changeDirectionTimer > 2000 + Math.random() * 3000) {
        ghost.direction = Math.random() * Math.PI * 2;
        ghost.vx = Math.cos(ghost.direction) * ghost.speed;
        ghost.vy = Math.sin(ghost.direction) * ghost.speed;
        ghost.changeDirectionTimer = 0;
      }
      
      // Move ghost
      ghost.x += ghost.vx;
      ghost.y += ghost.vy;
      
      // Wrap around edges
      if (ghost.x < -14) ghost.x = this.width + 14;
      if (ghost.x > this.width + 14) ghost.x = -14;
      if (ghost.y < -14) ghost.y = this.height + 14;
      if (ghost.y > this.height + 14) ghost.y = -14;
    });
  }
  
  updateDots(deltaTime) {
    this.dots.forEach(dot => {
      if (!dot.eaten) {
        dot.pulseTime += deltaTime * 0.005;
      }
    });
    
    // Remove eaten dots and add new ones
    this.dots = this.dots.filter(dot => !dot.eaten);
    
    // Maintain dot count
    while (this.dots.length < this.config.dotCount) {
      this.addRandomDot();
    }
  }
  
  updateParticles(deltaTime) {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= deltaTime;
      particle.alpha = Math.max(0, particle.life / particle.maxLife);
    });
    
    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.life > 0);
  }
  
  checkCollisions() {
    // Check Pac-Man eating dots
    this.pacmanCharacters.forEach(pacman => {
      this.dots.forEach(dot => {
        if (!dot.eaten) {
          const dx = pacman.x - dot.x;
          const dy = pacman.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 20) {
            dot.eaten = true;
            this.addEatingParticle(dot.x, dot.y);
          }
        }
      });
    });
  }
  
  render() {
    // Clear canvas with fade effect for trail
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.renderDots();
    this.renderGhosts();
    this.renderPacmanCharacters();
    this.renderParticles();
  }
  
  renderPacmanCharacters() {
    this.pacmanCharacters.forEach(pacman => {
      this.ctx.save();
      this.ctx.translate(pacman.x, pacman.y);
      this.ctx.rotate(pacman.direction);
      
      if (this.sprites.pacman && this.sprites.pacman[pacman.colorIndex]) {
        this.ctx.drawImage(
          this.sprites.pacman[pacman.colorIndex],
          -pacman.size / 2,
          -pacman.size / 2,
          pacman.size,
          pacman.size
        );
      }
      
      this.ctx.restore();
    });
  }
  
  renderGhosts() {
    this.ghosts.forEach(ghost => {
      this.ctx.save();
      this.ctx.translate(ghost.x, ghost.y);
      
      if (this.sprites.ghost && this.sprites.ghost[ghost.colorIndex]) {
        this.ctx.drawImage(
          this.sprites.ghost[ghost.colorIndex],
          -ghost.size / 2,
          -ghost.size / 2,
          ghost.size,
          ghost.size
        );
      }
      
      this.ctx.restore();
    });
  }
  
  renderDots() {
    this.dots.forEach(dot => {
      if (!dot.eaten) {
        this.ctx.save();
        
        // Pulsing effect
        const scale = 1 + Math.sin(dot.pulseTime) * 0.2;
        const alpha = 0.8 + Math.sin(dot.pulseTime * 2) * 0.2;
        
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(dot.x, dot.y);
        this.ctx.scale(scale, scale);
        
        if (this.sprites.dot) {
          this.ctx.drawImage(
            this.sprites.dot,
            -4, -4, 8, 8
          );
        }
        
        this.ctx.restore();
      }
    });
  }
  
  renderParticles() {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
  
  addEatingParticle(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 1,
        color: '#FFE800',
        life: 1000,
        maxLife: 1000,
        alpha: 1
      });
    }
  }
  
  addPacmanMovement() {
    // Add some visual feedback when typing correctly
    this.pacmanCharacters.forEach(pacman => {
      // Slight speed boost
      const boost = 1.2;
      pacman.vx *= boost;
      pacman.vy *= boost;
      
      // Return to normal speed after a short time
      setTimeout(() => {
        pacman.vx /= boost;
        pacman.vy /= boost;
      }, 200);
    });
  }
  
  addCompletionEffect() {
    // Create celebration particles
    const colors = ['#FFE800', '#FF2667', '#0080FF', '#00FF80', '#FF69B4'];
    
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 200,
        y: this.height / 2 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 3000,
        maxLife: 3000,
        alpha: 1
      });
    }
    
    // Make all Pac-Man characters move faster temporarily
    this.pacmanCharacters.forEach(pacman => {
      pacman.speed *= 2;
      pacman.vx *= 2;
      pacman.vy *= 2;
    });
    
    // Return to normal after celebration
    setTimeout(() => {
      this.pacmanCharacters.forEach(pacman => {
        pacman.speed /= 2;
        pacman.vx /= 2;
        pacman.vy /= 2;
      });
    }, 3000);
  }
  
  cleanup() {
    this.stop();
    console.log('Animation Manager cleaned up');
  }
}