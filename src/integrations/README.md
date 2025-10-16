# Goose Integration for GitHub Automation

This module integrates [Goose AI](https://github.com/block/goose) - a powerful AI coding agent - with the multi-agent GitHub automation system.

## Overview

Goose is an AI-powered coding assistant that can help with:
- **Code Analysis**: Static analysis, complexity metrics, security scanning
- **Code Generation**: Creating new code from natural language descriptions
- **Code Refactoring**: Improving code quality and maintainability
- **Bug Fixing**: Identifying and fixing bugs automatically
- **Test Generation**: Creating comprehensive test suites
- **Documentation**: Generating high-quality code documentation
- **Code Review**: Providing intelligent feedback on pull requests

## Architecture

The Goose integration consists of three main components:

### 1. Goose Integration (`src/integrations/goose-integration.js`)
Low-level client for communicating with the Goose API. Handles:
- Connection management and health checks
- Session management for contextual conversations
- Task execution with retry logic
- Event emission for monitoring

### 2. Goose Agent (`src/agents/goose-agent.js`)
High-level agent wrapper that integrates with the multi-agent framework. Provides:
- Standardized agent interface
- Task routing and capability checking
- Result formatting and error handling
- Status monitoring and reporting

### 3. Goose GitHub Workflow (`src/workflows/goose-github-workflow.js`)
GitHub-specific workflow automation. Features:
- Automatic PR review and analysis
- Intelligent labeling based on code analysis
- Issue handling and code generation suggestions
- Review comments with actionable suggestions

## Installation

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Goose** installation (local or remote)
3. **GitHub Token** with appropriate permissions

### Setup Steps

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```env
# Goose Configuration
GOOSE_API_KEY=your_goose_api_key
GOOSE_ENDPOINT=http://localhost:8080
GOOSE_MODEL=goose-default

# GitHub Configuration
GITHUB_TOKEN=your_github_token

# Application Configuration
PORT=3000
LOG_LEVEL=info
```

3. Start Goose (if running locally):
```bash
# Follow Goose installation instructions
# https://github.com/block/goose
goose server start
```

4. Start the automation server:
```bash
npm start
```

## Configuration

Configuration is managed through `src/config/goose-config.js`. Key settings:

```javascript
export const gooseConfig = {
  goose: {
    enabled: true,
    endpoint: 'http://localhost:8080',
    model: 'goose-default',
    temperature: 0.2,
    maxTokens: 4096
  },
  
  workflow: {
    enabled: true,
    autoReview: true,      // Auto-review PRs
    autoComment: true,      // Auto-comment on PRs/issues
    autoLabel: true         // Auto-label based on analysis
  },
  
  tasks: {
    codeAnalysis: { enabled: true },
    codeReview: { enabled: true },
    codeGeneration: { enabled: true },
    testGeneration: { enabled: true },
    documentation: { enabled: true }
  }
};
```

## Usage

### 1. Webhook Integration

Configure GitHub webhooks to point to your server:

**Webhook URL**: `https://your-server.com/webhooks/github/pull_request`

**Events to subscribe**:
- Pull requests (opened, synchronized, reopened)
- Issues (opened)
- Push

### 2. API Endpoints

#### Get Agent Status
```bash
GET /api/agents/goose/status
```

#### Execute Task
```bash
POST /api/agents/goose/execute
Content-Type: application/json

{
  "type": "code_analysis",
  "input": {
    "files": [
      { "path": "src/index.js", "content": "..." }
    ]
  }
}
```

#### Analyze Code
```bash
POST /api/goose/analyze
Content-Type: application/json

{
  "files": [...],
  "type": "full"
}
```

#### Generate Code
```bash
POST /api/goose/generate
Content-Type: application/json

{
  "prompt": "Create a REST API endpoint for user authentication",
  "language": "javascript",
  "style": "clean"
}
```

#### Review Code
```bash
POST /api/goose/review
Content-Type: application/json

{
  "files": [...],
  "focus": ["quality", "security", "performance"]
}
```

### 3. Programmatic Usage

```javascript
import { createGooseAgent } from './src/agents/goose-agent.js';

// Create agent
const agent = createGooseAgent({
  goose: {
    endpoint: 'http://localhost:8080',
    model: 'goose-default'
  }
});

// Initialize
await agent.initialize();

// Execute task
const result = await agent.execute({
  type: 'code_analysis',
  input: {
    files: [
      { path: 'src/app.js', content: '...' }
    ],
    type: 'security'
  }
});

console.log(result);
```

## Features

### Automatic PR Review

When a PR is opened or updated:
1. **Analysis**: Goose analyzes all changed files
2. **Review**: Provides line-by-line feedback
3. **Labels**: Adds relevant labels (security, complexity, etc.)
4. **Summary**: Posts a comprehensive review comment

### Issue Assistance

When an issue is created:
1. **Detection**: Checks if issue asks for code generation
2. **Generation**: Creates code based on issue description
3. **Posting**: Adds code suggestion as a comment

### Intelligent Labeling

Automatically adds labels based on analysis:
- `security-review-needed` - Security issues detected
- `high-complexity` - Complex code changes
- `performance-review-needed` - Performance concerns
- `needs-tests` - Missing test coverage
- `needs-documentation` - Missing documentation

## Advanced Features

### Custom Prompts
Customize Goose prompts for specific tasks (coming soon).

### Learning from Feedback
Train Goose based on accepted/rejected suggestions (coming soon).

### Parallel Processing
Process multiple PRs/issues simultaneously for faster response times.

### Context Awareness
Goose maintains context across multiple interactions for better suggestions.

## Monitoring

### Logs
Logs are stored in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

### Status Endpoints
- `/health` - Application health check
- `/api/agents/goose/status` - Goose agent status
- `/api/workflows/goose/status` - Workflow status

## Troubleshooting

### Goose Connection Issues

**Problem**: Cannot connect to Goose
**Solution**: 
1. Verify Goose is running: `curl http://localhost:8080/health`
2. Check `GOOSE_ENDPOINT` environment variable
3. Review logs for connection errors

### GitHub Authentication

**Problem**: GitHub API calls failing
**Solution**:
1. Verify `GITHUB_TOKEN` is set correctly
2. Check token has required permissions (repo, pull_request, issues)
3. Ensure token hasn't expired

### Webhook Not Triggering

**Problem**: PRs not being reviewed automatically
**Solution**:
1. Verify webhook URL is accessible from GitHub
2. Check webhook secret matches configuration
3. Review webhook delivery logs in GitHub

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- [Goose](https://github.com/block/goose) - The AI coding agent by Block
- [Octokit](https://github.com/octokit) - GitHub API client
- Multi-agent framework contributors

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Goose documentation: https://github.com/block/goose
