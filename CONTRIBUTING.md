# Contributing to Multi-Agent GitHub Automation

Thank you for your interest in contributing to this project! This guide will help you get started.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Code Style](#code-style)
4. [Testing](#testing)
5. [Pull Request Process](#pull-request-process)
6. [Agent Development](#agent-development)

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git
- GitHub account
- Goose AI (for Goose integration work)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/min-browser-enhancement-suite.git
cd min-browser-enhancement-suite
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/vivvek99/min-browser-enhancement-suite.git
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
GOOSE_API_KEY=your_key
GOOSE_ENDPOINT=http://localhost:8080
GITHUB_TOKEN=your_github_token
```

3. Start development server:
```bash
npm run dev
```

## Code Style

We use ESLint and Prettier for code formatting.

### Run Linter

```bash
npm run lint
```

### Auto-fix Issues

```bash
npm run lint:fix
```

### Format Code

```bash
npm run format
```

### Code Standards

- Use ES6+ features
- Use async/await over callbacks
- Add JSDoc comments for public functions
- Use meaningful variable names
- Keep functions small and focused
- Handle errors appropriately

## Testing

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

### Writing Tests

- Place tests in `src/__tests__/` directory
- Name test files `*.test.js`
- Use Jest as testing framework
- Mock external dependencies
- Aim for 80%+ code coverage

Example test:
```javascript
import { createGooseAgent } from '../agents/goose-agent.js';

describe('GooseAgent', () => {
  test('should initialize correctly', () => {
    const agent = createGooseAgent({ enabled: true });
    expect(agent.name).toBe('goose');
  });
});
```

## Pull Request Process

### Before Submitting

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes
3. Add tests for new functionality
4. Run tests and linter:
```bash
npm run lint
npm test
```

5. Commit your changes:
```bash
git commit -m "feat: Add your feature description"
```

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### Submitting PR

1. Push to your fork:
```bash
git push origin feature/your-feature-name
```

2. Open a Pull Request on GitHub
3. Fill out the PR template
4. Link related issues
5. Wait for review

### PR Review Process

- Maintainers will review your PR
- Address feedback and requested changes
- Keep PR focused on a single feature/fix
- Squash commits if requested
- Be patient and respectful

## Agent Development

### Creating a New Agent

1. Create agent file in `src/agents/`:
```javascript
// src/agents/my-agent.js
class MyAgent {
  constructor(config) {
    this.name = 'my-agent';
    this.capabilities = ['capability1', 'capability2'];
  }

  async initialize() {
    // Initialize agent
  }

  canHandle(task) {
    return this.capabilities.includes(task.type);
  }

  async execute(task) {
    // Execute task
  }
}
```

2. Create integration if needed:
```javascript
// src/integrations/my-integration.js
class MyIntegration {
  async connect() {
    // Connect to service
  }

  async executeTask(task) {
    // Execute task
  }
}
```

3. Add configuration:
```javascript
// src/config/my-config.js
export const myConfig = {
  enabled: true,
  // other settings
};
```

4. Create tests:
```javascript
// src/__tests__/my-agent.test.js
describe('MyAgent', () => {
  // Add tests
});
```

5. Update documentation:
- Add to README.md
- Create integration guide
- Update ARCHITECTURE.md

### Integration Guidelines

- Follow existing patterns
- Use consistent naming
- Add proper error handling
- Implement health checks
- Add logging
- Document API endpoints
- Include examples

## Questions?

- Open an issue for bugs
- Use discussions for questions
- Join our community chat (if available)
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
