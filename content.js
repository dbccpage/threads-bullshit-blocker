class ThreadsBullshitDetector {
  constructor() {
    this.settings = {
      enabled: true,
      threshold: 0.5
    };
    this.stats = {
      blocked: 0,
      analyzed: 0
    };
    // The bsDictionary is now loaded from bs_dictionary.js
    this.dictionary = typeof bsDictionary !== 'undefined' ? bsDictionary : {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    if (this.settings.enabled) {
      this.scanExistingPosts();
      this.observeNewPosts();
    }
  }

  async loadSettings() {
    const data = await chrome.storage.sync.get(['settings', 'stats']);
    this.settings = { ...this.settings, ...data.settings };
    this.stats = { ...this.stats, ...data.stats };
  }

  calculateBullshitScore(text) {
    if (!text || text.length < 20) return { score: 0, indicators: [] };

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const wordCount = words.length;
    let score = 0;
    const indicators = new Set();

    // Iterate over dictionary categories for scoring
    for (const category in this.dictionary) {
      const patterns = this.dictionary[category];
      let count = 0;
      patterns.forEach(pattern => {
        if (new RegExp(pattern, 'gi').test(lowerText)) {
          count++;
        }
      });

      if (count > 0) {
        indicators.add(category);
        // Assign different weights to categories if desired
        score += (count / wordCount) * (patterns.length * 0.01);
      }
    }
    
    // Add a multiplier for multiple red flags
    if (indicators.size >= 3) {
      score *= 1.2;
    }
    if (indicators.size >= 5) {
      score *= 1.15;
    }

    return {
      score: Math.min(score, 1.0),
      indicators: Array.from(indicators)
    };
  }

  scanExistingPosts() {
    document.querySelectorAll('[role="article"]').forEach(post => this.analyzePost(post));
  }

  analyzePost(postElement) {
    if (postElement.dataset.tbsbAnalyzed) return;
    postElement.dataset.tbsbAnalyzed = 'true';

    const textContent = postElement.innerText || "";
    if (textContent.length < 20) return;

    this.stats.analyzed++;
    const { score, indicators } = this.calculateBullshitScore(textContent);

    if (score >= this.settings.threshold) {
      this.blockPost(postElement, score, indicators);
    }
    this.updateStats();
  }
  
  blockPost(postElement, score, indicators) {
    this.stats.blocked++;
    postElement.classList.add('tbsb-blocked');

    // Use createElement for better security and performance
    const overlay = document.createElement('div');
    overlay.className = 'tbsb-overlay';

    const warningBox = document.createElement('div');
    warningBox.className = 'tbsb-warning';
    
    const title = document.createElement('h3');
    title.textContent = '🚨 Potential Bullshit Detected';
    
    const scoreDisplay = document.createElement('p');
    scoreDisplay.innerHTML = `<strong>Score: ${(score * 100).toFixed(0)}%</strong>`;
    
    const indicatorsTitle = document.createElement('strong');
    indicatorsTitle.textContent = 'Red Flags:';
    
    const indicatorsList = document.createElement('ul');
    indicators.slice(0, 3).forEach(ind => {
        const item = document.createElement('li');
        item.textContent = ind;
        indicatorsList.appendChild(item);
    });

    const showButton = document.createElement('button');
    showButton.className = 'tbsb-show-btn';
    showButton.textContent = 'Show Post';
    showButton.onclick = () => {
      postElement.classList.remove('tbsb-blocked');
      overlay.remove();
    };

    warningBox.append(title, scoreDisplay, indicatorsTitle, indicatorsList, showButton);
    overlay.appendChild(warningBox);
    postElement.style.position = 'relative';
    postElement.appendChild(overlay);
  }

  observeNewPosts() {
    // More targeted observer for performance
    const feedContainer = document.querySelector('main[role="main"]');
    if (!feedContainer) {
        // Fallback to body if main container not found
        console.warn("BS Blocker: Could not find main feed container, observing body.");
        this.observer = new MutationObserver(mutations => this.handleMutations(mutations));
        this.observer.observe(document.body, { childList: true, subtree: true });
        return;
    }

    this.observer = new MutationObserver(mutations => this.handleMutations(mutations));
    this.observer.observe(feedContainer, { childList: true, subtree: true });
  }
  
  handleMutations(mutations) {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if (node.matches('[role="article"]')) {
              this.analyzePost(node);
            } else {
              node.querySelectorAll('[role="article"]').forEach(post => this.analyzePost(post));
            }
          }
        }
      }
  }

  updateStats() {
    chrome.storage.sync.set({ stats: this.stats });
  }
}

new ThreadsBullshitDetector();
