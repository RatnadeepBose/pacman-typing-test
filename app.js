/**
 * Pac-Man Typing Test - Main Application Controller
 * Coordinates all managers and handles screen transitions
 */

class PacManTypingApp {
  constructor() {
    this.currentScreen = 'loading';
    this.settings = {
      difficulty: 'normal',
      mode: 'words',
      language: 'javascript',
      time: 3,
      soundEnabled: true,
      musicEnabled: true
    };
    
    this.managers = {
      sound: null,
      animation: null,
      typingTest: null
    };
    
    this.elements = {};
    this.isInitialized = false;
    
    this.init();
  }
  
  async init() {
    try {
      // Cache DOM elements
      this.cacheElements();
      
      // Initialize managers
      await this.initializeManagers();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start loading sequence
      this.startLoadingSequence();
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError('Failed to load application. Please refresh the page.');
    }
  }
  
  cacheElements() {
    // Screens
    this.elements.loadingScreen = document.getElementById('loadingScreen');
    this.elements.homeScreen = document.getElementById('homeScreen');
    this.elements.gameScreen = document.getElementById('gameScreen');
    this.elements.resultsScreen = document.getElementById('resultsScreen');
    this.elements.pauseScreen = document.getElementById('pauseScreen');
    
    // Controls
    this.elements.difficultySelect = document.getElementById('difficultySelect');
    this.elements.modeSelect = document.getElementById('modeSelect');
    this.elements.languageSelect = document.getElementById('languageSelect');
    this.elements.languageGroup = document.getElementById('languageGroup');
    this.elements.timeSelect = document.getElementById('timeSelect');
    this.elements.soundToggle = document.getElementById('soundToggle');
    this.elements.musicToggle = document.getElementById('musicToggle');
    
    // Buttons
    this.elements.startButton = document.getElementById('startButton');
    this.elements.pauseButton = document.getElementById('pauseButton');
    this.elements.retryButton = document.getElementById('retryButton');
    this.elements.exitButton = document.getElementById('exitButton');
    this.elements.resumeButton = document.getElementById('resumeButton');
    this.elements.restartButton = document.getElementById('restartButton');
    this.elements.quitButton = document.getElementById('quitButton');
    this.elements.retryTestButton = document.getElementById('retryTestButton');
    this.elements.homeButton = document.getElementById('homeButton');
    
    // Game elements
    this.elements.wpmDisplay = document.getElementById('wpmDisplay');
    this.elements.accuracyDisplay = document.getElementById('accuracyDisplay');
    this.elements.timeDisplay = document.getElementById('timeDisplay');
    this.elements.textDisplay = document.getElementById('textDisplay');
    this.elements.typingInput = document.getElementById('typingInput');
    
    // Results elements
    this.elements.finalWPM = document.getElementById('finalWPM');
    this.elements.finalAccuracy = document.getElementById('finalAccuracy');
    this.elements.charactersTyped = document.getElementById('charactersTyped');
    this.elements.errorsCount = document.getElementById('errorsCount');
    
    // Canvas
    this.elements.backgroundCanvas = document.getElementById('backgroundCanvas');
  }
  
  async initializeManagers() {
    // Initialize Sound Manager
    this.managers.sound = new SoundManager();
    await this.managers.sound.init();
    
    // Initialize Animation Manager
    this.managers.animation = new AnimationManager(this.elements.backgroundCanvas);
    await this.managers.animation.init();
    
    // Initialize Typing Test Manager
    this.managers.typingTest = new TypingTestManager();
    this.managers.typingTest.init();
    
    this.isInitialized = true;
  }
  
  setupEventListeners() {
    // Settings controls
    this.elements.modeSelect.addEventListener('change', (e) => {
      this.settings.mode = e.target.value;
      this.toggleLanguageSelect();
    });
    
    this.elements.difficultySelect.addEventListener('change', (e) => {
      this.settings.difficulty = e.target.value;
    });
    
    this.elements.languageSelect.addEventListener('change', (e) => {
      this.settings.language = e.target.value;
    });
    
    this.elements.timeSelect.addEventListener('change', (e) => {
      this.settings.time = parseInt(e.target.value);
    });
    
    // Sound controls
    this.elements.soundToggle.addEventListener('click', () => {
      this.toggleSound();
    });
    
    this.elements.musicToggle.addEventListener('click', () => {
      this.toggleMusic();
    });
    
    // Navigation buttons
    this.elements.startButton.addEventListener('click', () => {
      this.startGame();
    });
    
    this.elements.pauseButton.addEventListener('click', () => {
      this.pauseGame();
    });
    
    this.elements.retryButton.addEventListener('click', () => {
      this.retryGame();
    });
    
    this.elements.exitButton.addEventListener('click', () => {
      this.exitGame();
    });
    
    this.elements.resumeButton.addEventListener('click', () => {
      this.resumeGame();
    });
    
    this.elements.restartButton.addEventListener('click', () => {
      this.restartGame();
    });
    
    this.elements.quitButton.addEventListener('click', () => {
      this.quitGame();
    });
    
    this.elements.retryTestButton.addEventListener('click', () => {
      this.retryFromResults();
    });
    
    this.elements.homeButton.addEventListener('click', () => {
      this.goHome();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      if (this.managers.animation) {
        this.managers.animation.handleResize();
      }
    });
  }
  
  async startLoadingSequence() {
    // Simulate loading time for assets
    await this.sleep(2000);
    
    // Start background animations
    this.managers.animation.start();
    
    // Hide loading screen and show home
    this.switchScreen('home');
  }
  
  toggleLanguageSelect() {
    if (this.settings.mode === 'code') {
      this.elements.languageGroup.style.display = 'block';
    } else {
      this.elements.languageGroup.style.display = 'none';
    }
  }
  
  toggleSound() {
    this.settings.soundEnabled = !this.settings.soundEnabled;
    this.elements.soundToggle.textContent = this.settings.soundEnabled ? 'Sound On' : 'Sound Off';
    this.elements.soundToggle.classList.toggle('active', this.settings.soundEnabled);
    this.managers.sound.setSoundEnabled(this.settings.soundEnabled);
  }
  
  toggleMusic() {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    this.elements.musicToggle.textContent = this.settings.musicEnabled ? 'Music On' : 'Music Off';
    this.elements.musicToggle.classList.toggle('active', this.settings.musicEnabled);
    this.managers.sound.setMusicEnabled(this.settings.musicEnabled);
  }
  
  async startGame() {
    try {
      // Play start sound
      this.managers.sound.playSound('start');
      
      // Configure typing test
      const config = {
        difficulty: this.settings.difficulty,
        mode: this.settings.mode,
        language: this.settings.language,
        time: this.settings.time
      };
      
      // Initialize typing test
      await this.managers.typingTest.configure(config);
      
      // Setup typing test callbacks
      this.managers.typingTest.onStatsUpdate = (stats) => {
        this.updateGameMetrics(stats);
      };
      
      this.managers.typingTest.onComplete = (results) => {
        this.completeGame(results);
      };
      
      this.managers.typingTest.onCorrectKey = () => {
        this.managers.sound.playSound('typing');
        this.managers.animation.addPacmanMovement();
      };
      
      this.managers.typingTest.onIncorrectKey = () => {
        this.managers.sound.playSound('error');
      };
      
      // Switch to game screen
      this.switchScreen('game');
      
      // Start the test
      this.managers.typingTest.start();
      
      // Focus typing input
      setTimeout(() => {
        this.elements.typingInput.focus();
      }, 100);
      
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('Failed to start game. Please try again.');
    }
  }
  
  pauseGame() {
    this.managers.typingTest.pause();
    this.switchScreen('pause');
  }
  
  resumeGame() {
    this.managers.typingTest.resume();
    this.switchScreen('game');
    setTimeout(() => {
      this.elements.typingInput.focus();
    }, 100);
  }
  
  retryGame() {
    this.managers.typingTest.reset();
    this.startGame();
  }
  
  restartGame() {
    this.managers.typingTest.reset();
    this.startGame();
  }
  
  exitGame() {
    this.managers.typingTest.stop();
    this.switchScreen('home');
  }
  
  quitGame() {
    this.managers.typingTest.stop();
    this.switchScreen('home');
  }
  
  retryFromResults() {
    this.managers.typingTest.reset();
    this.startGame();
  }
  
  goHome() {
    this.managers.typingTest.stop();
    this.switchScreen('home');
  }
  
  completeGame(results) {
    // Play completion sound
    this.managers.sound.playSound('complete');
    
    // Add completion effect to animations
    this.managers.animation.addCompletionEffect();
    
    // Update results display
    this.updateResultsDisplay(results);
    
    // Switch to results screen
    this.switchScreen('results');
  }
  
  updateGameMetrics(stats) {
    this.elements.wpmDisplay.textContent = Math.round(stats.wpm) || 0;
    this.elements.accuracyDisplay.textContent = Math.round(stats.accuracy) + '%';
    this.elements.timeDisplay.textContent = this.formatTime(stats.timeRemaining);
    
    // Update text display
    this.elements.textDisplay.innerHTML = stats.formattedText;
  }
  
  updateResultsDisplay(results) {
    this.elements.finalWPM.textContent = Math.round(results.wpm) || 0;
    this.elements.finalAccuracy.textContent = Math.round(results.accuracy) + '%';
    this.elements.charactersTyped.textContent = results.charactersTyped || 0;
    this.elements.errorsCount.textContent = results.errors || 0;
  }
  
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  switchScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Handle loading screen separately
    if (this.currentScreen === 'loading' && screenName !== 'loading') {
      this.elements.loadingScreen.classList.add('hidden');
    }
    
    // Show target screen
    let targetScreen;
    switch (screenName) {
      case 'home':
        targetScreen = this.elements.homeScreen;
        break;
      case 'game':
        targetScreen = this.elements.gameScreen;
        break;
      case 'results':
        targetScreen = this.elements.resultsScreen;
        break;
      case 'pause':
        targetScreen = this.elements.pauseScreen;
        break;
    }
    
    if (targetScreen) {
      targetScreen.classList.add('active', 'fade-in');
      setTimeout(() => {
        targetScreen.classList.remove('fade-in');
      }, 300);
    }
    
    this.currentScreen = screenName;
  }
  
  handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not typing
    if (e.target === this.elements.typingInput) {
      return;
    }
    
    switch (e.key) {
      case 'Escape':
        if (this.currentScreen === 'game') {
          this.pauseGame();
        } else if (this.currentScreen === 'pause') {
          this.resumeGame();
        }
        break;
      case 'Enter':
        if (this.currentScreen === 'home') {
          this.startGame();
        }
        break;
      case 'r':
      case 'R':
        if (this.currentScreen === 'results' || this.currentScreen === 'pause') {
          this.retryFromResults();
        }
        break;
    }
  }
  
  showError(message) {
    // Simple error display - could be enhanced with a modal
    console.error(message);
    alert(message);
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pacmanApp = new PacManTypingApp();
});