# Contributing to Min Browser Enhancement Suite

Thank you for your interest in contributing to the Min Browser Enhancement Suite! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Your Changes](#testing-your-changes)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, videos, URLs)
- **Describe the behavior you observed** and what you expected
- **Include details about your environment**:
  - Min Browser version
  - Operating System and version
  - Userscript versions

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any similar features** in other browsers or extensions

### Contributing Code

#### Site Adapters

If you'd like to add support for a new video site:

1. Create a new adapter file in the `site-adapters/` directory
2. Use the `ExampleAdapter.js` as a template
3. Follow the adapter structure and naming conventions
4. Test thoroughly on the target site
5. Document the adapter in `site-adapters/README.md`

#### Userscript Improvements

When improving existing userscripts:

1. Ensure backward compatibility when possible
2. Test with multiple video sites
3. Document any new configuration options
4. Update the userscript version number
5. Add comments explaining complex logic

## Development Setup

### Prerequisites

- [Min Browser](https://minbrowser.org/) installed
- A text editor or IDE (VS Code, Sublime Text, etc.)
- Git for version control

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/min-browser-enhancement-suite.git
   cd min-browser-enhancement-suite
   ```

3. Create a symbolic link to your Min Browser userscripts directory:
   ```bash
   # macOS example
   ln -s $(pwd)/userscripts /Users/YOUR-USERNAME/Library/Application\ Support/Min/userscripts
   ```

4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Contribution Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clear, commented code
   - Follow the existing code style
   - Test your changes thoroughly

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```

   Commit message guidelines:
   - Use the present tense ("Add feature" not "Added feature")
   - Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
   - Limit the first line to 72 characters or less
   - Reference issues and pull requests liberally after the first line

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template with details about your changes

## Coding Standards

### JavaScript Style Guide

- Use ES6+ features (const/let, arrow functions, template literals)
- Use 2 or 4 spaces for indentation (be consistent with the file you're editing)
- Use meaningful variable and function names
- Add comments for complex logic
- Wrap code in IIFE (Immediately Invoked Function Expression) for userscripts
- Use strict mode: `'use strict';`

### Userscript Headers

Always include proper userscript headers:

```javascript
// ==UserScript==
// @name         Your Script Name
// @namespace    https://min.userscripts
// @version      1.0
// @description  Brief description of what the script does
// @match        *://*/*
// @grant        none
// ==/UserScript==
```

### Code Comments

- Add JSDoc-style comments for functions:
  ```javascript
  /**
   * Brief description of function
   * @param {Type} paramName - Description of parameter
   * @returns {Type} Description of return value
   */
  ```

- Add inline comments for complex logic
- Keep comments up-to-date with code changes

## Testing Your Changes

### Manual Testing

1. **Install the Modified Userscripts**
   - Copy your modified scripts to Min's userscripts directory
   - Restart Min Browser or reload the scripts

2. **Test on Multiple Sites**
   - Test on at least 3-5 different video sites
   - Verify the feature works as expected
   - Check for console errors

3. **Test Edge Cases**
   - Multiple videos on the same page
   - Dynamic content loading
   - Different video players (HTML5, embedded, etc.)
   - Mobile/responsive views

4. **Performance Testing**
   - Check CPU usage
   - Monitor memory consumption
   - Verify smooth video playback
   - Test with multiple tabs open

### Browser Console Testing

Open the browser console (Ctrl+Shift+I or Cmd+Option+I) to:
- Check for JavaScript errors
- Verify debug messages from your scripts
- Test script functionality interactively

## Pull Request Process

1. **Update Documentation**
   - Update README.md if adding new features
   - Update site-adapters/README.md if adding new adapters
   - Update .page file with any roadmap changes

2. **Ensure Code Quality**
   - No console errors
   - Code is well-commented
   - Follows coding standards

3. **Describe Your Changes**
   - Clearly explain what the PR does
   - Include screenshots/videos if applicable
   - Reference any related issues

4. **Be Responsive**
   - Address reviewer feedback promptly
   - Make requested changes
   - Update the PR description if scope changes

## Additional Resources

- [Min Browser Documentation](https://minbrowser.org/)
- [Userscript Development Guide](https://wiki.greasespot.net/Greasemonkey_Manual)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

## Questions?

If you have questions about contributing, please:
- Check existing issues and discussions
- Open a new issue with the "question" label
- Reach out to the maintainers

Thank you for contributing to Min Browser Enhancement Suite! 🎉
