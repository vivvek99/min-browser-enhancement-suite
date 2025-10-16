# Goose Integration Examples

This directory contains practical examples demonstrating how to use the Goose AI integration.

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
GOOSE_API_KEY=your_key
GOOSE_ENDPOINT=http://localhost:8080
```

3. Start Goose service (if running locally):
```bash
# Follow Goose installation instructions
goose server start
```

## Running Examples

### Analyze Code

Demonstrates code analysis for quality, security, and best practices:

```bash
node examples/analyze-code.js
```

This example:
- Initializes the Goose agent
- Analyzes sample JavaScript code
- Reports findings on code quality
- Suggests improvements

### Generate Code

Shows how to generate code from natural language descriptions:

```bash
node examples/generate-code.js
```

This example:
- Takes a natural language prompt
- Generates JavaScript code
- Includes documentation
- Handles edge cases

### Review Code

Demonstrates automated code review capabilities:

```bash
node examples/review-code.js
```

This example:
- Reviews code for security issues
- Checks best practices
- Identifies potential bugs
- Provides actionable feedback

## Example Output

### Analyze Code Example
```
🦢 Goose Code Analysis Example

Initializing Goose agent...
✅ Goose agent initialized

Analyzing code...

✅ Analysis complete!

Results:
{
  "complexityScore": 3,
  "qualityScore": 7,
  "issues": [
    {
      "type": "style",
      "message": "Use const/let instead of var",
      "line": 2
    }
  ],
  "suggestions": [...]
}
```

## Customizing Examples

You can modify these examples to test with your own code:

```javascript
// In analyze-code.js, change the code to analyze:
const codeToAnalyze = `
// Your code here
`;

// In generate-code.js, change the prompt:
const prompt = `
Create a function that...
`;
```

## API Reference

For detailed API documentation, see:
- [Integration README](../src/integrations/README.md)
- [Goose Integration Guide](../docs/GOOSE_INTEGRATION.md)

## Troubleshooting

### Connection Issues

If examples fail to connect:

1. Verify Goose is running:
```bash
curl http://localhost:8080/health
```

2. Check environment variables:
```bash
echo $GOOSE_ENDPOINT
```

3. Review logs for errors

### Authentication Issues

Ensure `GOOSE_API_KEY` is set correctly if your Goose instance requires authentication.

## Next Steps

After running these examples:

1. Explore the [Integration README](../src/integrations/README.md)
2. Set up GitHub webhooks for automated PR reviews
3. Customize configuration in `src/config/goose-config.js`
4. Integrate with your CI/CD pipeline

## Support

For questions or issues:
- Check the [documentation](../docs/GOOSE_INTEGRATION.md)
- Open an issue on GitHub
- Review Goose documentation: https://github.com/block/goose
