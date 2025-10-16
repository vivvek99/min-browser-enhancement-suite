# Perplexity Adapter - Quick Start Guide

## 🚀 Installation (30 seconds)

1. Copy `PerplexityAdapter.js` to your Min Browser userscripts folder
2. Restart Min Browser
3. Visit perplexity.ai

## 💡 What You Get

✅ **Floating button** in top-right corner  
✅ **Instant access** to recently visited spaces  
✅ **Space history** tracked automatically  
✅ **One-click navigation** to any recent space  

## 📍 How to Use

### Access Your Spaces
1. Click the purple button (top-right)
2. See your 10 most recent spaces
3. Click any space to navigate instantly

### What's Tracked
- **Space Name**: Automatically detected
- **Last Visited**: Shows "5m ago", "2h ago", etc.
- **Visit Count**: How many times you've been there
- **Recent Mark**: ⭐ for your most recent space

## ⚙️ Quick Config

Edit these lines in `PerplexityAdapter.js`:

```javascript
buttonPosition: 'top-right',    // Change to 'top-left', 'bottom-right', 'bottom-left'
autoNavigate: false,            // Set to true for auto-navigation
showNotifications: true,        // Set to false to disable toasts
maxSpaceHistory: 10,            // Change max spaces tracked
```

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Auto-Detect** | Spaces are tracked automatically when you visit them |
| **Persistent** | History saved in localStorage (survives restarts) |
| **Smart Naming** | Extracts space names from page content |
| **Visual Menu** | Beautiful dropdown with all your recent spaces |
| **Time Display** | Human-readable timestamps (e.g., "Just now", "3d ago") |
| **Access Counter** | See how many times you've visited each space |

## 🐛 Debug Console

Open browser console and try:

```javascript
// View your history
PerplexityAdapter.getSpaceHistory()

// Get most recent space
PerplexityAdapter.getMostRecentSpace()

// Clear all history
PerplexityAdapter.clearHistory()

// Navigate to a space
PerplexityAdapter.navigateToSpace('/space/abc123')
```

## 🎨 Visual Elements

- **Button Color**: Purple gradient (#667eea → #764ba2)
- **Badge**: Shows space count
- **Menu Style**: White with shadow and animations
- **Hover Effect**: Button lifts on hover
- **Recent Highlight**: Light purple background

## 📱 Status Badge

The badge on the button shows:
- **Number**: How many spaces are tracked
- **Updates**: In real-time as you visit spaces

## ⌨️ Pro Tips

1. **Quick Access**: Keep the button visible for instant access
2. **Visit Frequency**: Most visited spaces appear with higher counts
3. **Recent First**: Most recent space always at the top with ⭐
4. **Auto-Navigation**: Enable for automatic redirect to recent space
5. **Local Storage**: All data stays in your browser (private & secure)

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not showing | Restart Min Browser |
| Spaces not tracked | Visit spaces directly (click links) |
| History not saving | Check localStorage permissions |
| Wrong position | Edit `buttonPosition` in config |

## 📊 What Gets Stored

For each space:
- Unique space ID
- Space name (when available)
- Space URL
- Last access timestamp
- Total access count

**Storage Location**: `localStorage.perplexity_recent_spaces`

## 🎯 100% Complete Features

✅ Space detection and tracking  
✅ Floating button UI  
✅ Dropdown menu with history  
✅ Time formatting (human-readable)  
✅ Access counting  
✅ Persistent storage  
✅ SPA navigation support  
✅ Auto-navigation option  
✅ Toast notifications  
✅ DOM observation  
✅ API monitoring  
✅ Space name extraction  
✅ Debug console API  
✅ Configurable settings  
✅ Multiple position options  

## 📚 Full Documentation

See `PERPLEXITY_GUIDE.md` for complete documentation including:
- Detailed feature explanations
- Advanced configuration
- Developer API
- Technical architecture
- Troubleshooting guide

---

**Status**: ✅ **100% Complete** (Fully Functional from 0-100%)  
**Version**: 1.0.0  
**Tested**: ✓ Ready for production use
