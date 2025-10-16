/**
 * Example: Using Goose to Analyze Code
 * 
 * This example demonstrates how to use the Goose agent to analyze code
 * for quality, security, and best practices.
 */

import { createGooseAgent } from '../src/agents/goose-agent.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function analyzeCodeExample() {
  console.log('🦢 Goose Code Analysis Example\n');

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

  // Example code to analyze
  const codeToAnalyze = `
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

function applyDiscount(total, discount) {
  return total - (total * discount / 100);
}
`;

  console.log('Analyzing code...\n');

  try {
    // Analyze the code
    const result = await agent.execute({
      type: 'code_analysis',
      input: {
        files: [
          {
            path: 'example.js',
            content: codeToAnalyze
          }
        ],
        type: 'full',
        context: {
          description: 'E-commerce calculation functions'
        }
      }
    });

    if (result.success) {
      console.log('✅ Analysis complete!\n');
      console.log('Results:');
      console.log(JSON.stringify(result.result, null, 2));
    } else {
      console.error('❌ Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
  } finally {
    // Shutdown agent
    await agent.shutdown();
    console.log('\n🦢 Goose agent shut down');
  }
}

// Run the example
analyzeCodeExample().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
