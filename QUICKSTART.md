# Goose Integration - Quick Start Guide

## Overview

This guide will help you quickly set up and test the Goose AI integration with the GitHub automation system.

## What is Goose?

Goose is an AI-powered coding agent developed by Block (formerly Square) that assists with:
- Code analysis and review
- Code generation from natural language
- Bug detection and fixing
- Test generation
- Documentation generation
- Code refactoring

## Architecture

```
GitHub Events → Webhooks → Goose Workflow → Goose Agent → Goose API
```

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm 9+
- Goose installed and running (https://github.com/block/goose)
- GitHub Personal Access Token

### 2. Installation

```bash
# Clone and install
git clone https://github.com/vivvek99/min-browser-enhancement-suite.git
cd min-browser-enhancement-suite
npm install
```

### 3. Configuration

Create `.env` file:
```env
# Goose Configuration
GOOSE_API_KEY=
GOOSE_ENDPOINT=http://localhost:8080
GOOSE_MODEL=goose-default

# GitHub Configuration
GITHUB_TOKEN=ghp_your_token_here

# Server Configuration
PORT=3000
LOG_LEVEL=info
```

### 4. Start Goose Service

If running Goose locally:
```bash
# Start Goose server
goose server start

# Verify it's running
curl http://localhost:8080/health
```

### 5. Start Automation Server

```bash
npm start
```

Server should start on http://localhost:3000

### 6. Test the Integration

#### Option A: Run Examples

```bash
# Test code analysis
node examples/analyze-code.js

# Test code generation
node examples/generate-code.js

# Test code review
node examples/review-code.js
```

#### Option B: Test API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Agent status
curl http://localhost:3000/api/agents/goose/status

# Analyze code
curl -X POST http://localhost:3000/api/goose/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{"path": "test.js", "content": "console.log(\"hello\");"}],
    "type": "full"
  }'
```

#### Option C: Test with GitHub Webhook

1. Set up ngrok for local testing:
```bash
ngrok http 3000
```

2. Configure GitHub webhook:
   - Go to your repository settings
   - Add webhook: `https://your-ngrok-url.ngrok.io/webhooks/github/pull_request`
   - Select events: Pull requests
   - Save

3. Open a test PR and watch the automation work!

## Key Files

- `src/index.js` - Main entry point
- `src/integrations/goose-integration.js` - Goose API client
- `src/agents/goose-agent.js` - Agent wrapper
- `src/workflows/goose-github-workflow.js` - GitHub workflow automation
- `src/config/goose-config.js` - Configuration
- `.env.example` - Environment template

## Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Goose service running and accessible
- [ ] Server starts without errors (`npm start`)
- [ ] Health endpoint responds (`curl http://localhost:3000/health`)
- [ ] Agent status endpoint responds
- [ ] Examples run successfully
- [ ] API endpoints work correctly
- [ ] GitHub webhooks configured (optional)
- [ ] PR review automation working (optional)

## Troubleshooting

### Server won't start
- Check logs in `logs/error.log`
- Verify all dependencies installed
- Check port 3000 is not in use

### Cannot connect to Goose
- Verify Goose is running: `curl http://localhost:8080/health`
- Check `GOOSE_ENDPOINT` in `.env`
- Review Goose installation

### GitHub API errors
- Verify `GITHUB_TOKEN` has correct permissions
- Check token hasn't expired
- Review rate limits

### Examples fail
- Ensure server is running
- Check Goose connection
- Review console logs for errors

## Production Deployment

### Using Docker

```bash
# Build image
docker build -t github-automation .

# Run container
docker run -p 3000:3000 \
  -e GOOSE_ENDPOINT=http://goose:8080 \
  -e GITHUB_TOKEN=your_token \
  github-automation
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/index.js --name github-automation

# Monitor
pm2 logs github-automation
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
GOOSE_ENDPOINT=https://goose.your-domain.com
GITHUB_TOKEN=ghp_production_token
LOG_LEVEL=info
```

## Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Agent status
curl http://localhost:3000/api/agents/goose/status

# Workflow status
curl http://localhost:3000/api/workflows/goose/status
```

### Logs

```bash
# View all logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Live monitoring
npm run dev  # Uses nodemon for auto-reload
```

## Next Steps

1. **Customize Configuration**: Edit `src/config/goose-config.js`
2. **Add More Agents**: Create new agents in `src/agents/`
3. **Extend Workflows**: Add workflows in `src/workflows/`
4. **Setup CI/CD**: Use GitHub Actions workflow
5. **Add More Examples**: Create custom examples
6. **Configure Webhooks**: Set up production webhooks

## Documentation

- [Integration README](src/integrations/README.md) - Detailed integration guide
- [GOOSE_INTEGRATION.md](docs/GOOSE_INTEGRATION.md) - Complete documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [Examples](examples/README.md) - Example scripts

## Support

- GitHub Issues: https://github.com/vivvek99/min-browser-enhancement-suite/issues
- Goose Documentation: https://github.com/block/goose
- Architecture Guide: See ARCHITECTURE.md

## Success Indicators

Your integration is working correctly when:

✅ Server starts without errors  
✅ Health endpoint returns 200 OK  
✅ Examples run successfully  
✅ Agent status shows "healthy: true"  
✅ PR reviews appear automatically (if webhooks configured)  
✅ No errors in logs  

## Common Use Cases

### Automated PR Review
Set up webhooks to automatically review all pull requests with security, quality, and performance checks.

### Code Generation from Issues
When issues contain code requests, Goose automatically suggests implementations.

### Continuous Documentation
Automatically generate and update documentation for code changes.

### Test Generation
Generate comprehensive test suites for new features.

## Performance Tips

- Use caching for repeated analyses
- Enable parallel processing for multiple PRs
- Adjust `maxTokens` based on your needs
- Monitor memory usage with large codebases
- Use request queuing for high-traffic repos

## Security Considerations

- Keep `GITHUB_TOKEN` secure and scoped appropriately
- Use HTTPS for production deployments
- Validate webhook signatures
- Review Goose-generated code before merging
- Monitor API usage and rate limits

---

**Need Help?** Check the documentation or open an issue on GitHub!
