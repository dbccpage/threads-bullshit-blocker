document.addEventListener('DOMContentLoaded', async () => {
  try {
    const settings = await chrome.storage.sync.get(['threshold', 'enabled', 'stats']);
    
    document.getElementById('enabled').checked = settings.enabled !== false;
    document.getElementById('threshold').value = settings.threshold || 0.5;
    document.getElementById('threshold-display').textContent = 
      `${((settings.threshold || 0.5) * 100).toFixed(0)}%`;
    
    if (settings.stats) {
      document.getElementById('blocked-count').textContent = settings.stats.blocked || 0;
      document.getElementById('detection-rate').textContent = 
        `${settings.stats.rate || 0}%`;
    }
    
    document.getElementById('enabled').onchange = (e) => {
      chrome.storage.sync.set({ enabled: e.target.checked });
    };
    
    document.getElementById('threshold').oninput = (e) => {
      const value = parseFloat(e.target.value);
      chrome.storage.sync.set({ threshold: value });
      document.getElementById('threshold-display').textContent = 
        `${(value * 100).toFixed(0)}%`;
    };
  } catch (error) {
    console.log('Settings loading failed:', error);
  }
});