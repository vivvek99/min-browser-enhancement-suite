# Testing Guide

This document describes the testing infrastructure for the Min Browser Enhancement Suite.

## Test Infrastructure

The project uses Jest as the testing framework with the following configuration:

- **Test Runner**: Jest 29.7.0
- **Test Location**: `__tests__/` directory
- **Coverage**: Enabled with reports in `coverage/` directory

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Validation

### Syntax validation
```bash
npm run validate
```

This validates JavaScript syntax for all userscripts using Node.js `--check` flag.

## Linting

### Run ESLint
```bash
npm run lint
```

### Auto-fix linting issues
```bash
npm run lint:fix
```

## Code Formatting

### Format code with Prettier
```bash
npm run format
```

## Current Test Suite

### Syntax Validation Tests
- Validates JavaScript syntax for main userscripts
- Ensures directory structure exists

The tests are minimal and focused on ensuring:
1. All userscripts have valid JavaScript syntax
2. Required directories exist
3. Basic project structure is maintained

## Coverage

The coverage report shows 0% for userscripts, which is expected since:
- Userscripts are designed to run in a browser environment
- They interact with browser APIs and DOM
- Full functional testing would require browser automation (e.g., Playwright or Puppeteer)

The syntax validation tests ensure that the code is syntactically correct, even if functional tests are not feasible in a Node.js environment.

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

See `.github/workflows/multi-agent-automation.yml` for the complete CI configuration.
