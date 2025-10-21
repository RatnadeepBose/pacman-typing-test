/**
 * Sound Manager for Pac-Man Typing Test
 * Handles all audio functionality including sound effects and background music
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.backgroundMusic = null;
    this.audioContext = null;
    this.masterVolume = 0.7;
    this.soundVolume = 0.8;
    this.musicVolume = 0.3;
    this.isInitialized = false;
  }
  
  async init() {
    try {
      // Initialize Web Audio Context for better sound control
      this.initAudioContext();
      
      // Load all sound effects
      await this.loadSounds();
      
      this.isInitialized = true;
      console.log('Sound Manager initialized successfully');
    } catch (error) {
      console.warn('Sound Manager initialization failed:', error);
      // Continue without sound rather than breaking the app
      this.isInitialized = false;
    }
  }
  
  initAudioContext() {
    try {
      // Try to create AudioContext for better sound control
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (window.AudioContext) {
        this.audioContext = new AudioContext();
        console.log('Web Audio API initialized');
      }
    } catch (error) {
      console.warn('Web Audio API not available, falling back to HTML5 audio');
      this.audioContext = null;
    }
  }
  
  async loadSounds() {
    const soundDefinitions = {
      typing: 'sounds/pacman-eat.mp3',
      error: 'sounds/error.mp3',
      start: 'sounds/game-start.mp3',
      complete: 'sounds/level-complete.mp3',
      backgroundMusic: 'sounds/pacman-theme.mp3'
    };
    
    // Load each sound with fallback handling
    for (const [name, src] of Object.entries(soundDefinitions)) {
      try {
        if (name === 'backgroundMusic') {
          await this.loadBackgroundMusic(src);
        } else {
          await this.loadSoundEffect(name, src);
        }
      } catch (error) {
        console.warn(`Failed to load sound: ${name}`, error);
        // Create silent fallback
        this.sounds[name] = this.createSilentAudio();
      }
    }
  }
  
  async loadSoundEffect(name, src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Create fallback beep sound if file doesn't exist
      const fallbackSound = this.createBeepSound(name);
      
      audio.addEventListener('canplaythrough', () => {
        this.sounds[name] = audio;
        console.log(`Loaded sound effect: ${name}`);
        resolve();
      });
      
      audio.addEventListener('error', (e) => {
        console.warn(`Failed to load ${name}, using fallback`);
        this.sounds[name] = fallbackSound;
        resolve(); // Resolve anyway with fallback
      });
      
      // Set audio properties
      audio.preload = 'auto';
      audio.volume = this.soundVolume * this.masterVolume;
      audio.src = src;
      
      // Try to load
      audio.load();
      
      // Timeout fallback
      setTimeout(() => {
        if (!this.sounds[name]) {
          console.warn(`Timeout loading ${name}, using fallback`);
          this.sounds[name] = fallbackSound;
          resolve();
        }
      }, 5000);
    });
  }
  
  async loadBackgroundMusic(src) {
    return new Promise((resolve) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        this.backgroundMusic = audio;
        console.log('Loaded background music');
        resolve();
      });
      
      audio.addEventListener('error', (e) => {
        console.warn('Failed to load background music');
        this.backgroundMusic = this.createSilentAudio();
        resolve();
      });
      
      // Set audio properties
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = this.musicVolume * this.masterVolume;
      audio.src = src;
      
      // Try to load
      audio.load();
      
      // Timeout fallback
      setTimeout(() => {
        if (!this.backgroundMusic) {
          console.warn('Timeout loading background music');
          this.backgroundMusic = this.createSilentAudio();
          resolve();
        }
      }, 5000);
    });
  }
  
  createBeepSound(type) {
    // Create synthetic beep sounds using Web Audio API
    if (!this.audioContext) {
      return this.createSilentAudio();
    }
    
    const beepSounds = {
      typing: { frequency: 800, duration: 0.1 },
      error: { frequency: 200, duration: 0.3 },
      start: { frequency: 600, duration: 0.5 },
      complete: { frequency: 1000, duration: 0.8 }
    };
    
    const config = beepSounds[type] || beepSounds.typing;
    
    return {
      play: () => {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
          oscillator.type = 'square';
          
          gainNode.gain.setValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + config.duration);
        } catch (error) {
          console.warn('Failed to play beep sound:', error);
        }
      },
      pause: () => {},
      currentTime: 0,
      volume: this.soundVolume
    };
  }
  
  createSilentAudio() {
    return {
      play: () => {},
      pause: () => {},
      currentTime: 0,
      volume: 0
    };
  }
  
  playSound(soundName) {
    if (!this.isInitialized || !this.soundEnabled) {
      return;
    }
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }
    
    try {
      // Reset sound to beginning
      if (sound.currentTime !== undefined) {
        sound.currentTime = 0;
      }
      
      // Play the sound
      const playPromise = sound.play();
      
      // Handle play promise for newer browsers
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Failed to play sound ${soundName}:`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  }
  
  startBackgroundMusic() {
    if (!this.isInitialized || !this.musicEnabled || !this.backgroundMusic) {
      return;
    }
    
    try {
      this.backgroundMusic.currentTime = 0;
      const playPromise = this.backgroundMusic.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Failed to start background music:', error);
        });
      }
    } catch (error) {
      console.warn('Error starting background music:', error);
    }
  }
  
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
      } catch (error) {
        console.warn('Error stopping background music:', error);
      }
    }
  }
  
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    console.log(`Sound effects ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    
    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    
    console.log(`Background music ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update all sound volumes
    Object.values(this.sounds).forEach(sound => {
      if (sound.volume !== undefined) {
        sound.volume = this.soundVolume * this.masterVolume;
      }
    });
    
    if (this.backgroundMusic && this.backgroundMusic.volume !== undefined) {
      this.backgroundMusic.volume = this.musicVolume * this.masterVolume;
    }
  }
  
  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    
    Object.values(this.sounds).forEach(sound => {
      if (sound.volume !== undefined) {
        sound.volume = this.soundVolume * this.masterVolume;
      }
    });
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.backgroundMusic && this.backgroundMusic.volume !== undefined) {
      this.backgroundMusic.volume = this.musicVolume * this.masterVolume;
    }
  }
  
  // Resume audio context on user interaction (required by browsers)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('Audio context resumed');
      }).catch(error => {
        console.warn('Failed to resume audio context:', error);
      });
    }
  }
  
  cleanup() {
    // Stop all sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound.pause) {
        sound.pause();
      }
    });
    
    this.stopBackgroundMusic();
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(error => {
        console.warn('Failed to close audio context:', error);
      });
    }
    
    console.log('Sound Manager cleaned up');
  }
}

// Auto-resume audio context on first user interaction
document.addEventListener('click', () => {
  if (window.pacmanApp && window.pacmanApp.managers.sound) {
    window.pacmanApp.managers.sound.resumeAudioContext();
  }
}, { once: true });