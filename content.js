class ThreadsBullshitDetector {
  constructor() {
    this.settings = {
      enabled: true,
      threshold: 0.5
    };
    // The bsDictionary is now loaded from bs_dictionary.js
    this.dictionary = typeof bsDictionary !== 'undefined' ? bsDictionary : {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    if (this.settings.enabled) {
      // Use a delay to ensure the page is fully loaded before the first scan
      setTimeout(() => {
        this.scanExistingPosts();
        this.observeNewPosts();
      }, 2000);
    }
  }

  async loadSettings() {
    const data = await chrome.storage.sync.get(['settings']);
    this.settings = { ...this.settings, ...data.settings };
  }

  calculateBullshitScore(text) {
    if (!text || text.trim().length < 10) {
      return { score: 0, indicators: [] };
    }

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/).filter(Boolean);
    const wordCount = words.length > 0 ? words.length : 1;
    let score = 0;
    const indicators = new Set();
    let spamCount = 0;

    const spamPatterns = this.dictionary["Spam & Bot Patterns"] || [];
    spamPatterns.forEach(pattern => {
      if (new RegExp(pattern, 'i').test(text)) {
        spamCount++;
      }
    });

    if (spamCount >= 3) {
      return { score: 1.0, indicators: ["Spam & Bot Patterns"] };
    }

    for (const category in this.dictionary) {
      if (category === "Spam & Bot Patterns") continue;

      const patterns = this.dictionary[category];
      patterns.forEach(pattern => {
        if (new RegExp(pattern, 'i').test(text)) {
          indicators.add(category);
          score += 0.05;
        }
      });
    }
    
    score += spamCount * 0.3;

    let normalizedScore = score * (10 / wordCount);

    if (indicators.size >= 3) {
      normalizedScore *= 1.2;
    }

    return {
      score: Math.min(normalizedScore, 1.0),
      indicators: Array.from(indicators)
    };
  }

  // *** NEW, MORE ROBUST SCANNING LOGIC ***
  findPosts(rootNode) {
    // This is a more stable way to find posts. It looks for a user's avatar
    // and then finds the main article container around it.
    const avatarLinks = rootNode.querySelectorAll('a[href^="/t/"]');
    const posts = new Set();
    avatarLinks.forEach(link => {
      const postArticle = link.closest('article');
      if (postArticle) {
        posts.add(postArticle);
      }
    });
    return Array.from(posts);
  }

  scanExistingPosts() {
    this.findPosts(document.body).forEach(post => this.addCheckButton(post));
  }
  
  addCheckButton(postElement) {
    if (postElement.querySelector('.tbsb-container')) return;

    const container = document.createElement('div');
    container.className = 'tbsb-container';

    const button = document.createElement('button');
    button.textContent = 'Check BS Score 🛡️';
    button.className = 'tbsb-check-btn';

    button.onclick = (e) => {
        e.stopPropagation();
        const textContent = this.extractPostText(postElement);
        if (!textContent) {
            button.textContent = "Error: Could not find text.";
            setTimeout(() => {
                button.textContent = 'Check BS Score 🛡️';
            }, 2000);
            return;
        }
        const { score, indicators } = this.calculateBullshitScore(textContent);
        
        const resultDisplay = document.createElement('div');
        resultDisplay.className = 'tbsb-result';
        let indicatorText = indicators.length > 0 ? indicators.slice(0, 2).join(', ') : 'None';
        resultDisplay.innerHTML = `<strong>Score: ${(score * 100).toFixed(0)}%</strong> | <small>Flags: ${indicatorText}</small>`;
        
        container.innerHTML = '';
        container.appendChild(resultDisplay);
    };

    container.appendChild(button);
    
    // Inject the button in a more reliable location, at the bottom of the post.
    postElement.appendChild(container);
  }

  // *** NEW, MORE ROBUST TEXT EXTRACTION ***
  extractPostText(postElement) {
    // This looks for the specific test ID Threads uses for post text.
    const textElement = postElement.querySelector('div[data-testid="post-text"]');
    if (textElement) {
        return textElement.innerText;
    }
    // Fallback for different post structures (e.g., quoted posts)
    const fallbackText = postElement.querySelector('div[dir="auto"] > span');
    if(fallbackText) {
        return fallbackText.innerText;
    }
    return '';
  }

  observeNewPosts() {
    const observer = new MutationObserver((mutations) => {
      // Use a timeout to handle rapid-fire changes from scrolling
      let timeout;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              this.findPosts(node).forEach(post => this.addCheckButton(post));
            }
          }
        }
      }, 500);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

new ThreadsBullshitDetector();
