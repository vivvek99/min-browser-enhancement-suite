# Site Adapter Template

This directory contains templates and example adapters for extending Min Browser Enhancement Suite to new video sites or custom players.

## How to Add a Site Adapter

1. Create a new JavaScript file, e.g. `my-site-adapter.js`.
2. Use the userscript pattern shown in the examples here to target your desired site/player.
3. Implement any site-specific logic for video controls, quality selection, or UI integration.
4. Document the adapter and any custom features in this README.

## Example Adapter Structure

```javascript
// ==UserScript==
// @name         MySite Adapter
// @match        *://myvideosite.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  // Site-specific logic here
})();
```

## Adapter Registry

| Adapter Name         | Target Site                      | Features/Notes               |
|----------------------|----------------------------------|------------------------------|
| ExampleAdapter.js    | example.com                      | Demo for custom controls     |
| PerplexityAdapter.js | perplexity.ai                    | Quick access to recently edited spaces, space history tracking, visual menu |
| ...                  | ...                              | ...                          |

Contribute your adapters by opening a PR and documenting here!