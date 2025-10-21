/**
 * Typing Test Manager for Pac-Man Typing Test
 * Handles all typing test logic, metrics calculation, and text management
 */

class TypingTestManager {
  constructor() {
    // Test configuration
    this.config = {
      difficulty: 'normal',
      mode: 'words',
      language: 'javascript',
      time: 3 // minutes
    };
    
    // Test content data
    this.contentData = {
      difficulties: {
        easy: {
          words: ["cat", "dog", "run", "fun", "sun", "hat", "bat", "mat", "car", "bar", "toy", "boy", "joy", "day", "way", "say", "may", "ray", "key", "see"],
          sentences: ["The cat runs fast.", "Dogs like to play.", "Sun is very bright.", "I love to read books.", "Birds fly in the sky."]
        },
        normal: {
          words: ["keyboard", "typing", "practice", "accuracy", "speed", "computer", "pacman", "arcade", "challenge", "improve", "exercise", "rhythm", "finger", "position"],
          sentences: ["Practice makes perfect typing.", "Arcade games are really fun.", "Typing speed improves with time.", "Focus on accuracy first, then speed."]
        },
        hard: {
          words: ["algorithm", "efficiency", "performance", "optimization", "sophisticated", "implementation", "architecture", "methodology", "comprehensive", "fundamental"],
          sentences: ["Algorithm efficiency determines program performance.", "Sophisticated implementations require careful optimization.", "Comprehensive testing ensures reliable software architecture."]
        },
        expert: {
          words: ["asynchronous", "polymorphism", "encapsulation", "abstraction", "inheritance", "composition", "instantiation", "serialization", "multithreading", "concurrency"],
          sentences: ["Asynchronous programming improves application responsiveness.", "Polymorphism enables flexible object-oriented design patterns.", "Encapsulation provides data security and code maintainability."]
        },
        advanced: {
          words: ["metaprogramming", "concurrency", "serialization", "deserialization", "multithreading", "parallelization", "synchronization", "virtualization", "containerization", "orchestration"],
          sentences: ["Metaprogramming techniques enable dynamic code generation.", "Concurrency management prevents race condition vulnerabilities.", "Containerization simplifies application deployment and scaling."]
        }
      },
      
      code_snippets: {
        python: [
          "def calculate_wpm(chars, time):\n    return (chars / 5) / (time / 60)",
          "for i in range(10):\n    print(f'Number: {i}')",
          "class PacMan:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y",
          "import pygame\nfrom typing import List, Tuple",
          "result = [x**2 for x in range(5) if x % 2 == 0]"
        ],
        javascript: [
          "function calculateWPM(chars, time) {\n  return (chars / 5) / (time / 60);\n}",
          "const pacman = { x: 0, y: 0, direction: 'right' };",
          "for (let i = 0; i < 10; i++) {\n  console.log(`Number: ${i}`);\n}",
          "const canvas = document.getElementById('gameCanvas');\nconst ctx = canvas.getContext('2d');",
          "setTimeout(() => {\n  console.log('Game started!');\n}, 1000);"
        ],
        cpp: [
          "#include <iostream>\n#include <vector>\nusing namespace std;",
          "class PacMan {\nprivate:\n  int x, y;\npublic:\n  PacMan(int startX, int startY);\n};",
          "for (int i = 0; i < 10; ++i) {\n  cout << \"Number: \" << i << endl;\n}",
          "vector<int> scores = {100, 200, 300};\nsort(scores.begin(), scores.end());",
          "auto lambda = [](int a, int b) { return a + b; };"
        ],
        java: [
          "public class PacMan {\n  private int x, y;\n  public PacMan(int x, int y) {\n    this.x = x; this.y = y;\n  }\n}",
          "List<Integer> scores = new ArrayList<>();\nscores.add(100);",
          "for (int i = 0; i < 10; i++) {\n  System.out.println(\"Number: \" + i);\n}",
          "Map<String, Integer> gameStats = new HashMap<>();",
          "try {\n  // Game logic here\n} catch (Exception e) {\n  e.printStackTrace();\n}"
        ]
      }
    };
    
    // Test state
    this.state = {
      isActive: false,
      isPaused: false,
      startTime: null,
      endTime: null,
      timeRemaining: 0,
      currentText: '',
      typedText: '',
      currentPosition: 0,
      errors: 0,
      totalChars: 0,
      correctChars: 0
    };
    
    // Timer
    this.timer = null;
    
    // Callbacks
    this.onStatsUpdate = null;
    this.onComplete = null;
    this.onCorrectKey = null;
    this.onIncorrectKey = null;
    
    // DOM elements
    this.elements = {
      textDisplay: null,
      typingInput: null
    };
  }
  
  init() {
    this.elements.textDisplay = document.getElementById('textDisplay');
    this.elements.typingInput = document.getElementById('typingInput');
    
    this.setupEventListeners();
    console.log('Typing Test Manager initialized');
  }
  
  setupEventListeners() {
    if (this.elements.typingInput) {
      this.elements.typingInput.addEventListener('input', (e) => {
        this.handleInput(e);
      });
      
      this.elements.typingInput.addEventListener('keydown', (e) => {
        this.handleKeyDown(e);
      });
    }
  }
  
  async configure(config) {
    this.config = { ...this.config, ...config };
    this.generateTestText();
    this.resetState();
    
    console.log('Typing test configured:', this.config);
  }
  
  generateTestText() {
    let text = '';
    
    if (this.config.mode === 'code') {
      // Generate code snippets
      const snippets = this.contentData.code_snippets[this.config.language] || this.contentData.code_snippets.javascript;
      text = snippets[Math.floor(Math.random() * snippets.length)];
    } else {
      // Generate words and sentences based on difficulty
      const difficulty = this.contentData.difficulties[this.config.difficulty] || this.contentData.difficulties.normal;
      
      // Mix words and sentences
      const words = [...difficulty.words];
      const sentences = [...difficulty.sentences];
      
      // Calculate target length based on time and average WPM
      const targetWPM = 40; // Average typing speed
      const targetWords = targetWPM * this.config.time;
      const targetChars = targetWords * 5; // 5 chars per word average
      
      let currentLength = 0;
      const textParts = [];
      
      // Add sentences first for context
      while (currentLength < targetChars * 0.6 && sentences.length > 0) {
        const sentence = sentences.splice(Math.floor(Math.random() * sentences.length), 1)[0];
        textParts.push(sentence);
        currentLength += sentence.length + 1; // +1 for space
      }
      
      // Fill remaining with individual words
      while (currentLength < targetChars && words.length > 0) {
        const word = words[Math.floor(Math.random() * words.length)];
        textParts.push(word);
        currentLength += word.length + 1; // +1 for space
      }
      
      text = textParts.join(' ');
    }
    
    this.state.currentText = text;
    this.updateTextDisplay();
  }
  
  resetState() {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.startTime = null;
    this.state.endTime = null;
    this.state.timeRemaining = this.config.time * 60; // Convert to seconds
    this.state.typedText = '';
    this.state.currentPosition = 0;
    this.state.errors = 0;
    this.state.totalChars = 0;
    this.state.correctChars = 0;
    
    if (this.elements.typingInput) {
      this.elements.typingInput.value = '';
      this.elements.typingInput.disabled = false;
    }
    
    this.clearTimer();
  }
  
  start() {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.startTime = Date.now();
    
    this.startTimer();
    this.updateStats();
    
    console.log('Typing test started');
  }
  
  pause() {
    this.state.isPaused = true;
    this.clearTimer();
    
    if (this.elements.typingInput) {
      this.elements.typingInput.disabled = true;
    }
    
    console.log('Typing test paused');
  }
  
  resume() {
    this.state.isPaused = false;
    this.startTimer();
    
    if (this.elements.typingInput) {
      this.elements.typingInput.disabled = false;
    }
    
    console.log('Typing test resumed');
  }
  
  stop() {
    this.state.isActive = false;
    this.state.endTime = Date.now();
    this.clearTimer();
    
    if (this.elements.typingInput) {
      this.elements.typingInput.disabled = true;
    }
    
    console.log('Typing test stopped');
  }
  
  reset() {
    this.stop();
    this.resetState();
    this.generateTestText();
    console.log('Typing test reset');
  }
  
  startTimer() {
    this.clearTimer();
    
    this.timer = setInterval(() => {
      if (!this.state.isPaused && this.state.isActive) {
        this.state.timeRemaining--;
        
        if (this.state.timeRemaining <= 0) {
          this.completeTest();
        } else {
          this.updateStats();
        }
      }
    }, 1000);
  }
  
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  handleInput(e) {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }
    
    const inputValue = e.target.value;
    const inputLength = inputValue.length;
    
    // Handle backspace
    if (inputLength < this.state.typedText.length) {
      this.state.typedText = inputValue;
      this.state.currentPosition = inputLength;
      this.updateTextDisplay();
      this.updateStats();
      return;
    }
    
    // Get the newly typed character
    const newChar = inputValue[inputLength - 1];
    const expectedChar = this.state.currentText[this.state.currentPosition];
    
    this.state.totalChars++;
    
    if (newChar === expectedChar) {
      // Correct character
      this.state.correctChars++;
      this.state.typedText = inputValue;
      this.state.currentPosition = inputLength;
      
      if (this.onCorrectKey) {
        this.onCorrectKey();
      }
      
      // Check if test is complete
      if (this.state.currentPosition >= this.state.currentText.length) {
        this.completeTest();
        return;
      }
      
    } else {
      // Incorrect character
      this.state.errors++;
      
      if (this.onIncorrectKey) {
        this.onIncorrectKey();
      }
      
      // Allow the incorrect character to be typed
      this.state.typedText = inputValue;
      this.state.currentPosition = inputLength;
    }
    
    this.updateTextDisplay();
    this.updateStats();
  }
  
  handleKeyDown(e) {
    // Handle special keys if needed
    if (e.key === 'Tab') {
      e.preventDefault();
      // Insert tab character for code mode
      if (this.config.mode === 'code') {
        const input = e.target;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        
        input.value = input.value.substring(0, start) + '\t' + input.value.substring(end);
        input.selectionStart = input.selectionEnd = start + 1;
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  }
  
  updateTextDisplay() {
    if (!this.elements.textDisplay) return;
    
    const text = this.state.currentText;
    const typedLength = this.state.currentPosition;
    let html = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let className = 'untyped';
      
      if (i < typedLength) {
        // Character has been typed
        const typedChar = this.state.typedText[i];
        if (typedChar === char) {
          className = 'correct';
        } else {
          className = 'incorrect';
        }
      } else if (i === typedLength) {
        // Current character to type
        className = 'current';
      }
      
      // Handle special characters for HTML display
      let displayChar = char;
      if (char === ' ') {
        displayChar = '&nbsp;';
      } else if (char === '\n') {
        displayChar = '<br>';
      } else if (char === '\t') {
        displayChar = '&nbsp;&nbsp;&nbsp;&nbsp;';
      } else if (char === '<') {
        displayChar = '&lt;';
      } else if (char === '>') {
        displayChar = '&gt;';
      } else if (char === '&') {
        displayChar = '&amp;';
      }
      
      html += `<span class="${className}">${displayChar}</span>`;
    }
    
    this.elements.textDisplay.innerHTML = html;
  }
  
  updateStats() {
    const stats = this.calculateStats();
    
    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        ...stats,
        formattedText: this.elements.textDisplay?.innerHTML || ''
      });
    }
  }
  
  calculateStats() {
    const timeElapsed = this.state.startTime ? (Date.now() - this.state.startTime) / 1000 : 0;
    
    // Calculate WPM (Words Per Minute)
    // Standard: 5 characters = 1 word
    const minutes = Math.max(timeElapsed / 60, 1/60); // Prevent division by zero
    const wpm = (this.state.correctChars / 5) / minutes;
    
    // Calculate accuracy
    const accuracy = this.state.totalChars > 0 ? (this.state.correctChars / this.state.totalChars) * 100 : 100;
    
    return {
      wpm: Math.max(0, wpm),
      accuracy: Math.max(0, Math.min(100, accuracy)),
      timeRemaining: Math.max(0, this.state.timeRemaining),
      timeElapsed: timeElapsed,
      charactersTyped: this.state.currentPosition,
      correctChars: this.state.correctChars,
      errors: this.state.errors,
      totalChars: this.state.totalChars,
      progress: (this.state.currentPosition / this.state.currentText.length) * 100
    };
  }
  
  completeTest() {
    this.stop();
    
    const results = this.calculateStats();
    
    if (this.onComplete) {
      this.onComplete(results);
    }
    
    console.log('Typing test completed:', results);
  }
  
  // Public methods for getting current state
  getStats() {
    return this.calculateStats();
  }
  
  isRunning() {
    return this.state.isActive && !this.state.isPaused;
  }
  
  isPaused() {
    return this.state.isPaused;
  }
  
  getProgress() {
    return (this.state.currentPosition / this.state.currentText.length) * 100;
  }
  
  getCurrentText() {
    return this.state.currentText;
  }
  
  getTypedText() {
    return this.state.typedText;
  }
}