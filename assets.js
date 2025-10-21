/**
 * Asset Manager for Pac-Man Typing Test
 * Handles loading and managing all game assets including sprites, sounds, and fallbacks
 */

class AssetManager {
  constructor() {
    this.assets = new Map();
    this.loadingPromises = new Map();
    this.failedAssets = new Set();
    this.loadingProgress = 0;
    this.totalAssets = 0;
    
    // Asset definitions with fallbacks
    this.assetDefinitions = {
      sprites: {
        pacman: {
          yellow: 'assets/pacman-yellow.png',
          red: 'assets/pacman-red.png',
          blue: 'assets/pacman-blue.png',
          green: 'assets/pacman-green.png'
        },
        ghosts: {
          pink: 'assets/ghost-pink.png',
          cyan: 'assets/ghost-cyan.png',
          orange: 'assets/ghost-orange.png',
          red: 'assets/ghost-red.png'
        },
        ui: {
          dot: 'assets/dot.png',
          logo: 'assets/logo.png',
          buttonBg: 'assets/button-bg.png'
        }
      },
      sounds: {
        effects: {
          typingCorrect: 'sounds/pacman-eat.mp3',
          typingError: 'sounds/error.mp3',
          gameStart: 'sounds/game-start.mp3',
          gameComplete: 'sounds/level-complete.mp3'
        },
        music: {
          background: 'sounds/pacman-theme.mp3'
        }
      }
    };
    
    this.fallbackAssets = new Map();
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
  }
  
  async init() {
    console.log('Initializing Asset Manager...');
    
    try {
      // Create fallback assets first
      this.createFallbackAssets();
      
      // Count total assets for progress tracking
      this.countTotalAssets();
      
      // Load all assets
      await this.loadAllAssets();
      
      console.log('Asset Manager initialized successfully');
      
      if (this.onComplete) {
        this.onComplete();
      }
      
    } catch (error) {
      console.error('Failed to initialize Asset Manager:', error);
      
      if (this.onError) {
        this.onError(error);
      }
    }
  }
  
  countTotalAssets() {
    this.totalAssets = 0;
    
    // Count sprite assets
    for (const category of Object.values(this.assetDefinitions.sprites)) {
      this.totalAssets += Object.keys(category).length;
    }
    
    // Count sound assets
    for (const category of Object.values(this.assetDefinitions.sounds)) {
      this.totalAssets += Object.keys(category).length;
    }
  }
  
  async loadAllAssets() {
    const loadPromises = [];
    
    // Load sprites
    for (const [categoryName, category] of Object.entries(this.assetDefinitions.sprites)) {
      for (const [assetName, assetPath] of Object.entries(category)) {
        const promise = this.loadSprite(`${categoryName}.${assetName}`, assetPath);
        loadPromises.push(promise);
      }
    }
    
    // Load sounds
    for (const [categoryName, category] of Object.entries(this.assetDefinitions.sounds)) {
      for (const [assetName, assetPath] of Object.entries(category)) {
        const promise = this.loadSound(`${categoryName}.${assetName}`, assetPath);
        loadPromises.push(promise);
      }
    }
    
    // Wait for all assets to load (or fail)
    await Promise.allSettled(loadPromises);
    
    console.log(`Asset loading complete. Failed assets: ${this.failedAssets.size}`);
  }
  
  async loadSprite(key, path) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this.assets.set(key, img);
        this.updateProgress();
        console.log(`Loaded sprite: ${key}`);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${key}, using fallback`);
        this.failedAssets.add(key);
        
        // Use fallback asset
        const fallback = this.fallbackAssets.get(key);
        if (fallback) {
          this.assets.set(key, fallback);
        }
        
        this.updateProgress();
        resolve(fallback || null);
      };
      
      // Set source to start loading
      img.src = path;
      
      // Timeout fallback
      setTimeout(() => {
        if (!this.assets.has(key)) {
          console.warn(`Timeout loading sprite: ${key}`);
          img.onerror();
        }
      }, 10000); // 10 second timeout
    });
  }
  
  async loadSound(key, path) {
    return new Promise((resolve) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        this.assets.set(key, audio);
        this.updateProgress();
        console.log(`Loaded sound: ${key}`);
        resolve(audio);
      });
      
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound: ${key}, using fallback`);
        this.failedAssets.add(key);
        
        // Use fallback sound
        const fallback = this.fallbackAssets.get(key);
        if (fallback) {
          this.assets.set(key, fallback);
        }
        
        this.updateProgress();
        resolve(fallback || null);
      });
      
      // Set audio properties
      audio.preload = 'auto';
      audio.src = path;
      
      // Start loading
      audio.load();
      
      // Timeout fallback
      setTimeout(() => {
        if (!this.assets.has(key)) {
          console.warn(`Timeout loading sound: ${key}`);
          audio.dispatchEvent(new Event('error'));
        }
      }, 15000); // 15 second timeout for sounds
    });
  }
  
  createFallbackAssets() {
    console.log('Creating fallback assets...');
    
    // Create fallback Pac-Man sprites
    this.createFallbackPacmanSprites();
    
    // Create fallback ghost sprites
    this.createFallbackGhostSprites();
    
    // Create fallback UI elements
    this.createFallbackUIElements();
    
    // Create fallback sounds
    this.createFallbackSounds();
  }
  
  createFallbackPacmanSprites() {
    const colors = {
      yellow: '#FFE800',
      red: '#FF2667',
      blue: '#0080FF',
      green: '#00FF80'
    };
    
    for (const [colorName, colorValue] of Object.entries(colors)) {
      const canvas = this.createCanvas(32, 32);
      const ctx = canvas.getContext('2d');
      
      // Draw Pac-Man shape
      ctx.fillStyle = colorValue;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(16, 16);
      ctx.closePath();
      ctx.fill();
      
      // Add border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      this.fallbackAssets.set(`sprites.${colorName}`, canvas);
    }
  }
  
  createFallbackGhostSprites() {
    const colors = {
      pink: '#FF69B4',
      cyan: '#00FFFF',
      orange: '#FFA500',
      red: '#FF0000'
    };
    
    for (const [colorName, colorValue] of Object.entries(colors)) {
      const canvas = this.createCanvas(32, 32);
      const ctx = canvas.getContext('2d');
      
      // Draw ghost body
      ctx.fillStyle = colorValue;
      ctx.beginPath();
      ctx.arc(16, 16, 12, Math.PI, 0);
      ctx.lineTo(28, 28);
      
      // Draw wavy bottom
      for (let i = 0; i < 4; i++) {
        const x = 28 - (i + 1) * 6;
        const y = 28 - (i % 2) * 4;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(4, 28);
      ctx.closePath();
      ctx.fill();
      
      // Draw eyes
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(12, 12, 3, 0, 2 * Math.PI);
      ctx.arc(20, 12, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(12, 12, 1.5, 0, 2 * Math.PI);
      ctx.arc(20, 12, 1.5, 0, 2 * Math.PI);
      ctx.fill();
      
      this.fallbackAssets.set(`ghosts.${colorName}`, canvas);
    }
  }
  
  createFallbackUIElements() {
    // Create dot sprite
    const dotCanvas = this.createCanvas(8, 8);
    const dotCtx = dotCanvas.getContext('2d');
    
    dotCtx.fillStyle = '#FFE800';
    dotCtx.beginPath();
    dotCtx.arc(4, 4, 3, 0, 2 * Math.PI);
    dotCtx.fill();
    
    this.fallbackAssets.set('ui.dot', dotCanvas);
    
    // Create simple logo
    const logoCanvas = this.createCanvas(200, 60);
    const logoCtx = logoCanvas.getContext('2d');
    
    logoCtx.fillStyle = '#FFE800';
    logoCtx.font = 'bold 24px Arial';
    logoCtx.textAlign = 'center';
    logoCtx.fillText('PAC-MAN', 100, 25);
    logoCtx.fillText('TYPING', 100, 50);
    
    this.fallbackAssets.set('ui.logo', logoCanvas);
    
    // Create button background
    const buttonCanvas = this.createCanvas(200, 50);
    const buttonCtx = buttonCanvas.getContext('2d');
    
    buttonCtx.fillStyle = 'rgba(255, 232, 0, 0.2)';
    buttonCtx.fillRect(0, 0, 200, 50);
    buttonCtx.strokeStyle = '#FFE800';
    buttonCtx.lineWidth = 2;
    buttonCtx.strokeRect(1, 1, 198, 48);
    
    this.fallbackAssets.set('ui.buttonBg', buttonCanvas);
  }
  
  createFallbackSounds() {
    // Create silent audio objects as fallbacks
    const silentAudio = {
      play: () => Promise.resolve(),
      pause: () => {},
      load: () => {},
      currentTime: 0,
      duration: 0,
      volume: 0
    };
    
    // Map all sound keys to silent fallbacks
    this.fallbackAssets.set('effects.typingCorrect', { ...silentAudio });
    this.fallbackAssets.set('effects.typingError', { ...silentAudio });
    this.fallbackAssets.set('effects.gameStart', { ...silentAudio });
    this.fallbackAssets.set('effects.gameComplete', { ...silentAudio });
    this.fallbackAssets.set('music.background', { ...silentAudio, loop: true });
  }
  
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  
  updateProgress() {
    const loadedCount = this.assets.size;
    this.loadingProgress = (loadedCount / this.totalAssets) * 100;
    
    if (this.onProgress) {
      this.onProgress(this.loadingProgress, loadedCount, this.totalAssets);
    }
  }
  
  // Public methods for accessing assets
  getAsset(key) {
    return this.assets.get(key) || this.fallbackAssets.get(key) || null;
  }
  
  getSprite(category, name) {
    return this.getAsset(`${category}.${name}`);
  }
  
  getSound(category, name) {
    return this.getAsset(`${category}.${name}`);
  }
  
  hasAsset(key) {
    return this.assets.has(key) || this.fallbackAssets.has(key);
  }
  
  isLoaded(key) {
    return this.assets.has(key);
  }
  
  isFailed(key) {
    return this.failedAssets.has(key);
  }
  
  getLoadingProgress() {
    return this.loadingProgress;
  }
  
  getFailedAssets() {
    return Array.from(this.failedAssets);
  }
  
  // Utility methods
  preloadImages(urls) {
    return Promise.all(
      urls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  }
  
  preloadSounds(urls) {
    return Promise.all(
      urls.map(url => {
        return new Promise((resolve, reject) => {
          const audio = new Audio();
          audio.addEventListener('canplaythrough', () => resolve(audio));
          audio.addEventListener('error', reject);
          audio.src = url;
          audio.load();
        });
      })
    );
  }
  
  cleanup() {
    // Clear all assets
    this.assets.clear();
    this.fallbackAssets.clear();
    this.failedAssets.clear();
    this.loadingPromises.clear();
    
    console.log('Asset Manager cleaned up');
  }
}