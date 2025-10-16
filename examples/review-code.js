/**
 * Example: Using Goose for Code Review
 * 
 * This example demonstrates how to use the Goose agent to review code
 * and provide feedback on quality, security, and best practices.
 */

import { createGooseAgent } from '../src/agents/goose-agent.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function reviewCodeExample() {
  console.log('🦢 Goose Code Review Example\n');

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

  // Example code to review
  const codeToReview = `
const express = require('express');
const app = express();

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT * FROM users WHERE id = ' + userId;
  
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (username === 'admin' && password === 'password123') {
    res.json({ success: true, token: 'abc123' });
  } else {
    res.json({ success: false });
  }
});

app.listen(3000);
`;

  console.log('Reviewing code for security and best practices...\n');

  try {
    const result = await agent.execute({
      type: 'code_review',
      input: {
        files: [
          {
            path: 'server.js',
            content: codeToReview
          }
        ],
        focus: ['security', 'best-practices', 'quality'],
        context: {
          description: 'Express.js API server'
        }
      }
    });

    if (result.success) {
      console.log('✅ Code review complete!\n');
      console.log('Review Results:');
      console.log(JSON.stringify(result.result, null, 2));
    } else {
      console.error('❌ Code review failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during review:', error.message);
  } finally {
    // Shutdown agent
    await agent.shutdown();
    console.log('\n🦢 Goose agent shut down');
  }
}

// Run the example
reviewCodeExample().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
