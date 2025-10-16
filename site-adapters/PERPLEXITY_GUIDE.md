# Perplexity Space Access Adapter - Complete Guide

## Overview

The Perplexity Space Access Adapter is a comprehensive solution for managing and accessing your Perplexity.ai Spaces. It provides instant access to your most recently edited spaces with a beautiful, intuitive interface.

## Features (100% Complete)

### ✅ Core Functionality
- **Space Detection**: Automatically detects when you visit a Perplexity space
- **History Tracking**: Maintains a history of up to 10 most recently accessed spaces
- **Persistent Storage**: Saves space history in browser localStorage
- **Smart Navigation**: Quick-access menu for one-click navigation to any recent space
- **Access Counting**: Tracks how many times you've visited each space
- **Timestamp Tracking**: Records when each space was last accessed

### ✅ User Interface
- **Floating Button**: Beautiful gradient button positioned in the top-right corner
- **Space Counter**: Badge showing the number of spaces in your history
- **Dropdown Menu**: Sleek dropdown showing all recent spaces with:
  - Space names (or friendly IDs if name unavailable)
  - Time since last access (e.g., "2h ago", "Just now")
  - Access count for each space
  - Visual highlight for the most recent space (⭐)
- **Smooth Animations**: Professional slide-in animations and hover effects
- **Notifications**: Optional toast notifications when accessing spaces

### ✅ Advanced Features
- **URL Pattern Matching**: Detects spaces using regex pattern matching
- **SPA Navigation Support**: Works with Perplexity's single-page application routing
- **DOM Observation**: Monitors page changes to detect dynamically loaded content
- **API Interception**: Monitors space-related API calls for enhanced detection
- **Auto-Navigation**: Optional feature to automatically navigate to most recent space
- **Space Name Extraction**: Attempts to extract space names from page content
- **Time Formatting**: Human-readable time display (e.g., "3m ago", "2d ago")

### ✅ Configuration Options
- **Storage Key**: Customizable localStorage key for space history
- **Max History**: Configure maximum number of spaces to track (default: 10)
- **Button Position**: Choose from 4 corner positions (top-right, top-left, bottom-right, bottom-left)
- **Auto Navigate**: Enable/disable automatic navigation to most recent space
- **Show Notifications**: Toggle toast notifications on/off
- **Notification Duration**: Customize how long notifications display (default: 3000ms)

## Installation

### Step 1: Copy the Adapter File

Copy `PerplexityAdapter.js` to your Min Browser userscripts directory:

```bash
# Default location on macOS
cp site-adapters/PerplexityAdapter.js "/Users/vivek/Library/Application Support/Min/userscripts/site-adapters/"
```

### Step 2: Restart Min Browser

Restart Min Browser to load the new userscript.

### Step 3: Visit Perplexity.ai

Navigate to [perplexity.ai](https://www.perplexity.ai) and you should see the floating button appear in the top-right corner.

## Usage

### Accessing Recent Spaces

1. **Click the floating button** in the top-right corner
2. **View your space history** in the dropdown menu
3. **Click any space** to navigate to it instantly

### Space Information

Each space in the menu shows:
- **Space Name**: The name of the space (or a friendly ID)
- **Time Ago**: How long since you last visited (e.g., "5m ago")
- **Access Count**: Number of times you've visited this space
- **Recent Indicator**: The most recent space is marked with a ⭐

### Automatic Features

- **Space Detection**: When you visit a space, it's automatically added to your history
- **History Updates**: Space history is updated in real-time as you navigate
- **Persistent Storage**: Your history is saved and persists across browser sessions

## Configuration

You can customize the adapter by editing the `CONFIG` object at the top of the file:

```javascript
const CONFIG = {
  storageKey: 'perplexity_recent_spaces',  // localStorage key
  maxSpaceHistory: 10,                      // Max spaces to track
  buttonPosition: 'top-right',              // Button position
  autoNavigate: false,                      // Auto-navigate to recent space
  showNotifications: true,                  // Show toast notifications
  notificationDuration: 3000,               // Notification duration (ms)
  spaceUrlPattern: /\/space\/([a-zA-Z0-9_-]+)/, // URL pattern
  spaceApiPattern: /\/api\/.*space/i        // API pattern
};
```

### Button Position Options
- `'top-right'` (default)
- `'top-left'`
- `'bottom-right'`
- `'bottom-left'`

### Auto-Navigation

Enable auto-navigation to automatically go to your most recent space when visiting Perplexity.ai homepage:

```javascript
autoNavigate: true  // Change to true
```

## Developer API

The adapter exposes a debugging API on `window.PerplexityAdapter`:

```javascript
// Get all space history
window.PerplexityAdapter.getSpaceHistory()

// Get most recent space
window.PerplexityAdapter.getMostRecentSpace()

// Navigate to a specific space
window.PerplexityAdapter.navigateToSpace('/space/abc123')

// Clear history
window.PerplexityAdapter.clearHistory()
```

## Technical Details

### Space Detection Methods

1. **URL Pattern Matching**: Monitors URL for `/space/{id}` patterns
2. **DOM Observation**: Watches for page changes using MutationObserver
3. **History API Hooks**: Intercepts pushState/replaceState for SPA navigation
4. **API Monitoring**: Monitors fetch calls for space-related API requests
5. **Page Content Scanning**: Searches for space names in page elements

### Storage Format

Spaces are stored in localStorage as JSON:

```json
{
  "id": "abc123def",
  "name": "My Research Space",
  "url": "/space/abc123def",
  "lastAccessed": 1697450400000,
  "accessCount": 5
}
```

### Performance

- **Lightweight**: Minimal overhead with efficient observers
- **Optimized**: Uses throttled URL checking (500ms intervals)
- **Memory Efficient**: Limits history to configurable maximum
- **Non-Blocking**: All operations are asynchronous

## Styling

The adapter uses modern CSS with:
- **Gradient Backgrounds**: Beautiful purple gradient (from #667eea to #764ba2)
- **Smooth Animations**: All interactions are animated
- **Hover Effects**: Button lift effect on hover
- **Shadow Effects**: Professional depth with box shadows
- **Responsive**: Adapts to different screen sizes

## Browser Compatibility

- ✅ **Min Browser**: Primary target
- ✅ **Chromium-based**: Works in Chrome, Edge, Brave, etc.
- ✅ **Firefox**: Compatible with Firefox
- ✅ **Safari**: Works in Safari (with webkit prefix support)

## Troubleshooting

### Button Not Appearing
- Ensure the script is in the correct directory
- Restart Min Browser
- Check browser console for errors

### Spaces Not Being Tracked
- Visit a space by clicking on it in Perplexity
- Check localStorage permissions
- Clear browser cache and try again

### History Not Persisting
- Check localStorage is not disabled
- Verify you're on the correct domain
- Try clearing and rebuilding history

## Privacy & Security

- **Local Storage Only**: All data stored locally in your browser
- **No External Calls**: No data sent to external servers
- **Safe Interception**: API monitoring is read-only
- **No Tracking**: No analytics or user tracking

## Future Enhancements

Potential features for future versions:
- Space search/filter functionality
- Export/import space history
- Space categories/tags
- Keyboard shortcuts
- Favorites/pinned spaces
- Space preview on hover

## Support

For issues, feature requests, or contributions:
- Open an issue on GitHub
- Check the main README for contribution guidelines
- Reference the `.page` file for development roadmap

## Credits

Created as part of the Min Browser Enhancement Suite by [vivvek99](https://github.com/vivvek99).

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Status**: ✅ Complete (0-100%)  
**Last Updated**: 2025-10-16
