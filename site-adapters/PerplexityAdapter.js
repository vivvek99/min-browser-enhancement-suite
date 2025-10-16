// ==UserScript==
// @name         Perplexity Space Access
// @match        *://www.perplexity.ai/*
// @match        *://perplexity.ai/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /**************************************************************************
   * Perplexity Site Adapter for Min Browser Enhancement Suite
   * 
   * This adapter provides quick access to the most recently edited space
   * on Perplexity.ai. Features:
   * - Tracks recently accessed/edited spaces
   * - Provides a quick-access button to jump to most recent space
   * - Stores space history in localStorage
   * - Shows notification when accessing spaces
   ***************************************************************************/

  // Configuration
  const CONFIG = {
    storageKey: 'perplexity_recent_spaces',
    maxSpaceHistory: 10,
    buttonPosition: 'top-right', // top-right, top-left, bottom-right, bottom-left
    autoNavigate: false, // Set to true to automatically navigate to most recent space
    showNotifications: true,
    notificationDuration: 3000,
    spaceUrlPattern: /\/space\/([a-zA-Z0-9_-]+)/,
    spaceApiPattern: /\/api\/.*space/i
  };

  // State management
  let spaceHistory = [];
  let currentSpace = null;
  let observer = null;
  let quickAccessButton = null;

  /**************************************************************************
   * STORAGE FUNCTIONS
   ***************************************************************************/

  // Load space history from localStorage
  function loadSpaceHistory() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        spaceHistory = JSON.parse(stored);
        console.log('[PerplexityAdapter] Loaded space history:', spaceHistory);
      }
    } catch (err) {
      console.warn('[PerplexityAdapter] Could not load space history:', err);
      spaceHistory = [];
    }
  }

  // Save space history to localStorage
  function saveSpaceHistory() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(spaceHistory));
      console.log('[PerplexityAdapter] Saved space history');
    } catch (err) {
      console.warn('[PerplexityAdapter] Could not save space history:', err);
    }
  }

  // Add or update a space in history
  function updateSpaceHistory(spaceId, spaceName, spaceUrl) {
    const timestamp = Date.now();
    
    // Remove existing entry if present
    spaceHistory = spaceHistory.filter(s => s.id !== spaceId);
    
    // Add to front of array (most recent)
    spaceHistory.unshift({
      id: spaceId,
      name: spaceName || `Space ${spaceId.substring(0, 8)}`,
      url: spaceUrl || `/space/${spaceId}`,
      lastAccessed: timestamp,
      accessCount: (spaceHistory.find(s => s.id === spaceId)?.accessCount || 0) + 1
    });
    
    // Trim to max history size
    if (spaceHistory.length > CONFIG.maxSpaceHistory) {
      spaceHistory = spaceHistory.slice(0, CONFIG.maxSpaceHistory);
    }
    
    saveSpaceHistory();
    updateQuickAccessButton();
  }

  /**************************************************************************
   * SPACE DETECTION
   ***************************************************************************/

  // Detect current space from URL
  function detectSpaceFromUrl() {
    const match = window.location.pathname.match(CONFIG.spaceUrlPattern);
    if (match && match[1]) {
      const spaceId = match[1];
      if (currentSpace !== spaceId) {
        currentSpace = spaceId;
        console.log('[PerplexityAdapter] Detected space:', spaceId);
        
        // Try to get space name from page
        setTimeout(() => {
          const spaceName = getSpaceNameFromPage();
          updateSpaceHistory(spaceId, spaceName, window.location.pathname);
          
          if (CONFIG.showNotifications) {
            showNotification(`Accessing space: ${spaceName || spaceId}`);
          }
        }, 500);
      }
      return spaceId;
    }
    return null;
  }

  // Try to extract space name from page content
  function getSpaceNameFromPage() {
    // Try various selectors that might contain the space name
    const selectors = [
      'h1[class*="space"]',
      '[class*="space"][class*="title"]',
      '[class*="space"][class*="name"]',
      'header h1',
      '[data-testid*="space-name"]',
      '[aria-label*="space"]'
    ];
    
    for (const selector of selectors) {
      const elem = document.querySelector(selector);
      if (elem && elem.textContent.trim()) {
        return elem.textContent.trim();
      }
    }
    
    return null;
  }

  // Monitor for space-related API calls
  function interceptSpaceRequests() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0];
      
      if (typeof url === 'string' && CONFIG.spaceApiPattern.test(url)) {
        console.log('[PerplexityAdapter] Space API call detected:', url);
      }
      
      return originalFetch.apply(this, args);
    };
  }

  /**************************************************************************
   * UI COMPONENTS
   ***************************************************************************/

  // Create and inject quick access button
  function createQuickAccessButton() {
    if (quickAccessButton) return;
    
    quickAccessButton = document.createElement('div');
    quickAccessButton.id = 'pplx-quick-access';
    quickAccessButton.innerHTML = `
      <button id="pplx-recent-space-btn" title="Go to most recent space">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span id="pplx-space-count">0</span>
      </button>
      <div id="pplx-space-menu" style="display: none;">
        <div id="pplx-space-list"></div>
      </div>
    `;
    
    applyQuickAccessStyles();
    document.body.appendChild(quickAccessButton);
    
    // Add event listeners
    const btn = document.getElementById('pplx-recent-space-btn');
    btn.addEventListener('click', toggleSpaceMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!quickAccessButton.contains(e.target)) {
        closeSpaceMenu();
      }
    });
    
    updateQuickAccessButton();
  }

  // Apply styles to quick access button
  function applyQuickAccessStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #pplx-quick-access {
        position: fixed;
        ${getPositionStyles()}
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      #pplx-recent-space-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
      }
      
      #pplx-recent-space-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }
      
      #pplx-recent-space-btn:active {
        transform: translateY(0);
      }
      
      #pplx-space-count {
        background: rgba(255, 255, 255, 0.25);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 700;
      }
      
      #pplx-space-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 300px;
        max-width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        animation: slideIn 0.2s ease;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      #pplx-space-list {
        max-height: 400px;
        overflow-y: auto;
      }
      
      .pplx-space-item {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .pplx-space-item:hover {
        background: #f8f9fa;
      }
      
      .pplx-space-item:last-child {
        border-bottom: none;
      }
      
      .pplx-space-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }
      
      .pplx-space-meta {
        font-size: 12px;
        color: #999;
      }
      
      .pplx-space-recent {
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      }
      
      #pplx-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000000;
        animation: slideInNotif 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
      }
      
      @keyframes slideInNotif {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Get position styles based on config
  function getPositionStyles() {
    const positions = {
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;'
    };
    return positions[CONFIG.buttonPosition] || positions['top-right'];
  }

  // Update button with current space count
  function updateQuickAccessButton() {
    const countElem = document.getElementById('pplx-space-count');
    if (countElem) {
      countElem.textContent = spaceHistory.length;
    }
  }

  // Toggle space menu
  function toggleSpaceMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('pplx-space-menu');
    
    if (menu.style.display === 'none') {
      updateSpaceList();
      menu.style.display = 'block';
    } else {
      closeSpaceMenu();
    }
  }

  // Close space menu
  function closeSpaceMenu() {
    const menu = document.getElementById('pplx-space-menu');
    if (menu) {
      menu.style.display = 'none';
    }
  }

  // Update the space list in the menu
  function updateSpaceList() {
    const listElem = document.getElementById('pplx-space-list');
    if (!listElem) return;
    
    if (spaceHistory.length === 0) {
      listElem.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #999;">
          No spaces visited yet
        </div>
      `;
      return;
    }
    
    listElem.innerHTML = spaceHistory.map((space, index) => {
      const date = new Date(space.lastAccessed);
      const timeAgo = getTimeAgo(space.lastAccessed);
      const isRecent = index === 0;
      
      return `
        <div class="pplx-space-item ${isRecent ? 'pplx-space-recent' : ''}" data-space-url="${space.url}">
          <div class="pplx-space-name">
            ${isRecent ? '⭐ ' : ''}${space.name}
          </div>
          <div class="pplx-space-meta">
            ${timeAgo} • Visited ${space.accessCount} time${space.accessCount !== 1 ? 's' : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    listElem.querySelectorAll('.pplx-space-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-space-url');
        navigateToSpace(url);
        closeSpaceMenu();
      });
    });
  }

  // Navigate to a space
  function navigateToSpace(url) {
    console.log('[PerplexityAdapter] Navigating to space:', url);
    window.location.href = url;
  }

  // Get most recent space
  function getMostRecentSpace() {
    return spaceHistory.length > 0 ? spaceHistory[0] : null;
  }

  // Auto-navigate to most recent space if configured
  function autoNavigateToRecentSpace() {
    if (!CONFIG.autoNavigate) return;
    
    const recentSpace = getMostRecentSpace();
    if (recentSpace && !detectSpaceFromUrl() && window.location.pathname === '/') {
      console.log('[PerplexityAdapter] Auto-navigating to most recent space');
      setTimeout(() => navigateToSpace(recentSpace.url), 1000);
    }
  }

  // Show notification
  function showNotification(message) {
    const notif = document.createElement('div');
    notif.id = 'pplx-notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.remove();
    }, CONFIG.notificationDuration);
  }

  // Format time ago
  function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  /**************************************************************************
   * OBSERVERS
   ***************************************************************************/

  // Observe URL changes (for SPA navigation)
  function observeUrlChanges() {
    let lastUrl = window.location.href;
    
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('[PerplexityAdapter] URL changed:', currentUrl);
        detectSpaceFromUrl();
      }
    };
    
    // Check every 500ms
    setInterval(checkUrlChange, 500);
    
    // Also hook into history API
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      checkUrlChange();
    };
    
    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      checkUrlChange();
    };
  }

  // Observe DOM changes for dynamic content
  function observeDOMChanges() {
    observer = new MutationObserver((mutations) => {
      // Check if space information appeared
      if (!currentSpace) {
        detectSpaceFromUrl();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**************************************************************************
   * INITIALIZATION
   ***************************************************************************/

  function init() {
    console.log('[PerplexityAdapter] Initializing for Perplexity.ai');
    
    // Load saved history
    loadSpaceHistory();
    
    // Detect current space
    detectSpaceFromUrl();
    
    // Set up observers
    observeUrlChanges();
    observeDOMChanges();
    
    // Intercept API calls
    interceptSpaceRequests();
    
    // Create UI
    createQuickAccessButton();
    
    // Auto-navigate if configured
    autoNavigateToRecentSpace();
    
    console.log('[PerplexityAdapter] Initialization complete');
  }

  // Auto-initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for debugging
  window.PerplexityAdapter = {
    getSpaceHistory: () => spaceHistory,
    getMostRecentSpace,
    navigateToSpace,
    clearHistory: () => {
      spaceHistory = [];
      saveSpaceHistory();
      updateQuickAccessButton();
      console.log('[PerplexityAdapter] History cleared');
    }
  };

})();
