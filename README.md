# Min Browser Enhancement Suite

## Overview

This repository delivers a robust enhancement suite for [Min Browser](https://minbrowser.org/), focused on video performance, user experience, and developer diagnostics. It integrates advanced userscripts, optimal GPU/video launch configuration, and a clear developer/contributor workflow.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Userscripts](#userscripts)
- [Advanced Launch Command](#advanced-launch-command)
- [UI Components](#ui-components)
- [Developer Tools & Benchmarking](#developer-tools--benchmarking)
- [Customization & Site Adapters](#customization--site-adapters)
- [Contribution Guide](#contribution-guide)
- [Security Notes](#security-notes)

---

## Features

### Performance & Video Optimization

- **Staggered Video Start**: Prevents decoder/network overload by queuing play events.
- **Live Buffer Management**: Adaptive and hard-capped buffer trimming for all video elements.
- **CPU Relief**: Detects CPU saturation and lowers playbackRate to maintain smooth playback.
- **GPU Codec Preference**: Disables AV1/VP9, prefers H.264/AVC for hardware acceleration.
- **GPU Compositing**: Forces GPU compositing on videos for improved rendering.

### UI & User Experience

- **Auto In-Window Fullscreen**: Elevates video players into fullscreen within the browser window, preserving site controls.
- **Quality Lock**: Automatically selects and maintains highest available video quality, re-applies every 30s to defeat site auto-reversion.
- **Esc-to-Exit Fullscreen**: Escape key exits in-window fullscreen, with auto re-entry after a short delay.

### Developer HUD & Diagnostics

- **Real-time Overlay**: Toggleable overlay displays GPU info, CPU busy %, active videos, buffer stats, and dropped frames.
- **Hotkey Controls**:  
  - Ctrl+Shift+O: Toggle overlay  
  - Ctrl+Shift+S: Toggle staggered start  
  - Ctrl+Shift+[ / ]: Adjust buffer target  
  - Ctrl+Shift+R: Toggle CPU relief

### Volume Manager

- **Per-Site Memory**: Remembers and restores volume levels per site.
- **Clamp Slider**: Optionally clamps volume of background video tiles.

### UI Panels

- **Media Policy Banner**: Highlights current video/media policies.
- **Video Assist Bubble**: Provides quick actions for video control/quality.
- **Volume Manager UI**: Allows direct volume control and clamping.

### Developer Menu

- **Diagnostics Shortcuts**: Open chrome://gpu, chrome://version, and log GPU status from the app menu.

### Testing & Benchmarking

- **Performance Tools**: Benchmark dropped frames, buffer times, and CPU busy statistics across 40+ concurrent video tiles.

### Customization

- **Site Adapter Template**: Easily extend the enhancement suite to new sites using the provided template.

---

## Installation

### 1. Place Userscripts

Copy the following files into your Min Browser userscripts directory (by default:  
`/Users/vivek/Library/Application Support/Min/userscripts/`):

- `gpt-copy-14.js` – Min Optimizer + Overlay
- `auto-inwindow-fullscreen-quality-lock.js` – Auto In-Window Fullscreen + Overlay Play + Quality Lock

### 2. Advanced Launch Command

Start Min Browser using the optimal hardware flags for video and GPU acceleration:

```sh
env MIN_USER_SCRIPTS="/Users/vivek/Library/Application Support/Min/userscripts/" open -n -a "Min" --args --ignore-gpu-blocklist --enable-gpu-rasterization --enable-zero-copy --enable-native-gpu-memory-buffers --enable-accelerated-video-decode --enable-accelerated-video-encode --enable-features=VideoToolboxVideoDecoder,CanvasOopRasterization,UseSkiaRenderer --disable-software-rasterizer --disable-gpu-sandbox --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-features=MediaSourceExperimental,HardwareMediaKeyHandling --force-dark-mode
```

---

## Userscripts

### **gpt-copy-14.js** – Min Optimizer + Overlay

- Staggers video playback, enforces GPU-friendly codecs, and provides a developer HUD overlay.
- CPU relief and buffer trimming features keep playback smooth even under load.
- Hotkeys and overlay for real-time diagnostics.

### **auto-inwindow-fullscreen-quality-lock.js** – Auto In-Window Fullscreen + Quality Lock

- Clicks overlay and player controls for seamless in-window fullscreen.
- Locks highest available video quality, auto-reapplies as needed.
- Escape exits fullscreen, with automatic re-entry.

---

## UI Components

- **Media Policy Banner**: Shows current video policy state.
- **Video Assist Bubble**: Quick-access controls for video features.
- **Volume Manager UI**: Control site volumes and clamp background tiles.

---

## Developer Tools & Benchmarking

- **HUD Overlay**: Displays GPU, CPU, buffer, and dropped frames.
- **Diagnostics Menu**: Access detailed GPU/video diagnostics.
- **Testing Tools**: Benchmark video performance across many concurrent tiles.

---

## Customization & Site Adapters

- Use the `site-adapters/README.md` template to add support for new sites or custom video players.
- Site adapters allow private or public extension of this suite’s features.

---

## Contribution Guide

- See `.page` for PR roadmap: Electron bump, UI overhaul, extension points, etc.
- New contributors should reference the developer menu and site adapter template.
- All major features and UI panels are documented for ease of onboarding.

### Development Commands

This repository uses npm for development tooling:

```sh
# Install dependencies (ESLint, Prettier, etc.)
npm install

# Lint all JavaScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format all JS and MD files
npm run format

# Check formatting without making changes
npm run format:check

# Run both lint and format check
npm run validate
```

---

## Security Notes

- **Sandboxing**: Disabling the GPU sandbox is powerful but risky. Only use with trusted scripts and sources.
- **Context Isolation**: Maintains separation between browser and userscript contexts for safety.
- **Safe Defaults**: All scripts are designed to minimize risk and follow best practices for browser extension security.

---

## Credits

Developed by [vivvek99](https://github.com/vivvek99) and contributors.

---

## License

MIT License
