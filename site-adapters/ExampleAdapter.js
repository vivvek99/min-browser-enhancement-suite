// ==UserScript==
// @name         ExampleAdapter
// @match        *://example.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /**************************************************************************
   * Example Site Adapter for Min Browser Enhancement Suite
   * 
   * This adapter demonstrates how to extend the enhancement suite for a
   * specific video site. It shows patterns for:
   * - Detecting video players
   * - Customizing quality controls
   * - Site-specific UI interactions
   * - Integration with main suite features
   ***************************************************************************/

  // Configuration
  const CONFIG = {
    siteSpecificSelector: '.example-video-player',
    qualityMenuSelector: '.example-quality-menu',
    playButtonSelector: '.example-play-button',
    volumeStorageKey: 'example_site_volume'
  };

  // Initialize adapter when DOM is ready
  function init() {
    console.log('[ExampleAdapter] Initializing for example.com');
    
    // Hook into video elements
    hookVideoPlayers();
    
    // Set up site-specific observers
    observeDOMChanges();
    
    // Restore saved preferences
    restorePreferences();
  }

  // Hook video players with custom behavior
  function hookVideoPlayers() {
    const players = document.querySelectorAll(CONFIG.siteSpecificSelector);
    
    players.forEach(player => {
      const video = player.querySelector('video');
      if (!video || video._exampleAdapterHooked) return;
      
      video._exampleAdapterHooked = true;
      
      // Add custom event listeners
      video.addEventListener('play', handleVideoPlay);
      video.addEventListener('volumechange', handleVolumeChange);
      
      console.log('[ExampleAdapter] Hooked video player:', player);
    });
  }

  // Handle video play events
  function handleVideoPlay(e) {
    const video = e.target;
    console.log('[ExampleAdapter] Video started playing');
    
    // Example: Auto-apply quality settings
    setTimeout(() => applyQualityPreference(video), 500);
  }

  // Handle volume changes
  function handleVolumeChange(e) {
    const video = e.target;
    
    // Save volume preference for this site
    try {
      localStorage.setItem(CONFIG.volumeStorageKey, video.volume);
    } catch (err) {
      console.warn('[ExampleAdapter] Could not save volume:', err);
    }
  }

  // Apply preferred quality settings
  function applyQualityPreference(video) {
    // Example: Find and click quality menu
    const qualityMenu = document.querySelector(CONFIG.qualityMenuSelector);
    if (!qualityMenu) return;
    
    console.log('[ExampleAdapter] Applying quality preference');
    
    // Site-specific logic to select highest quality
    const qualityOptions = qualityMenu.querySelectorAll('[data-quality]');
    const highestQuality = Array.from(qualityOptions)
      .sort((a, b) => {
        const aVal = parseInt(a.getAttribute('data-quality')) || 0;
        const bVal = parseInt(b.getAttribute('data-quality')) || 0;
        return bVal - aVal;
      })[0];
    
    if (highestQuality) {
      highestQuality.click();
    }
  }

  // Restore user preferences
  function restorePreferences() {
    try {
      const savedVolume = localStorage.getItem(CONFIG.volumeStorageKey);
      if (savedVolume !== null) {
        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
          v.volume = parseFloat(savedVolume);
        });
        console.log('[ExampleAdapter] Restored volume:', savedVolume);
      }
    } catch (err) {
      console.warn('[ExampleAdapter] Could not restore preferences:', err);
    }
  }

  // Observe DOM for dynamically added players
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      hookVideoPlayers();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Auto-initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
