/**
 * Example: Using Goose to Generate Code
 * 
 * This example demonstrates how to use the Goose agent to generate code
 * from natural language descriptions.
 */

import { createGooseAgent } from '../src/agents/goose-agent.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateCodeExample() {
  console.log('🦢 Goose Code Generation Example\n');

  // Create and initialize Goose agent
  const agent = createGooseAgent({
    goose: {
      endpoint: process.env.GOOSE_ENDPOINT || 'http://localhost:8080',
      apiKey: process.env.GOOSE_API_KEY,
      enabled: true
    }
  });

  console.log('Initializing Goose agent...');
  const initialized = await agent.initialize();

  if (!initialized) {
    console.error('❌ Failed to initialize Goose agent');
    console.error('Make sure Goose is running at:', process.env.GOOSE_ENDPOINT);
    process.exit(1);
  }

  console.log('✅ Goose agent initialized\n');

  // Generate code from description
  const prompt = `
Create a JavaScript function that validates email addresses.
The function should:
- Accept an email string as input
- Return true if the email is valid, false otherwise
- Check for proper format (username@domain.extension)
- Handle edge cases like empty strings and null values
- Include JSDoc documentation
`;

  console.log('Generating code from prompt...\n');

  try {
    const result = await agent.execute({
      type: 'code_generation',
      input: {
        prompt: prompt.trim(),
        language: 'javascript',
        style: 'clean',
        context: {
          description: 'Email validation utility'
        }
      }
    });

    if (result.success) {
      console.log('✅ Code generation complete!\n');
      console.log('Generated Code:');
      console.log('---');
      if (result.result.code) {
        console.log(result.result.code);
      } else {
        console.log(JSON.stringify(result.result, null, 2));
      }
      console.log('---');
    } else {
      console.error('❌ Code generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during generation:', error.message);
  } finally {
    // Shutdown agent
    await agent.shutdown();
    console.log('\n🦢 Goose agent shut down');
  }
}

// Run the example
generateCodeExample().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
