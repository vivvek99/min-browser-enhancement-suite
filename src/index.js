/**
 * Multi-Agent GitHub Automation - Main Entry Point
 * 
 * Orchestrates the multi-agent system with Goose integration for GitHub automation.
 */

import express from 'express';
import dotenv from 'dotenv';
import winston from 'winston';
import { createGooseAgent } from './agents/goose-agent.js';
import { createGooseGitHubWorkflow } from './workflows/goose-github-workflow.js';
import gooseConfig from './config/goose-config.js';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

/**
 * Main Application Class
 */
class MultiAgentGitHubAutomation {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Initialize agents and workflows
    this.gooseAgent = null;
    this.gooseWorkflow = null;
    
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    logger.info('Initializing Multi-Agent GitHub Automation...');

    try {
      // Set up Express middleware
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));

      // Health check endpoint
      this.app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
      });

      // Initialize Goose agent
      logger.info('Initializing Goose agent...');
      this.gooseAgent = createGooseAgent(gooseConfig);
      await this.gooseAgent.initialize();

      // Initialize Goose GitHub workflow
      logger.info('Initializing Goose GitHub workflow...');
      this.gooseWorkflow = createGooseGitHubWorkflow(gooseConfig);
      await this.gooseWorkflow.initialize();

      // Set up webhook endpoints
      this.setupWebhooks();

      // Set up API endpoints
      this.setupApiEndpoints();

      this.initialized = true;
      logger.info('Multi-Agent GitHub Automation initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Set up GitHub webhook handlers
   */
  setupWebhooks() {
    // Pull request webhook
    this.app.post('/webhooks/github/pull_request', async (req, res) => {
      try {
        const payload = req.body;
        logger.info(`Received pull_request webhook: ${payload.action}`);
        
        // Handle pull request in background
        this.gooseWorkflow.handlePullRequest(payload).catch(error => {
          logger.error('Error handling pull request:', error);
        });

        res.status(202).json({ message: 'Webhook received' });
      } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Issue webhook
    this.app.post('/webhooks/github/issues', async (req, res) => {
      try {
        const payload = req.body;
        logger.info(`Received issues webhook: ${payload.action}`);
        
        // Handle issue in background
        this.gooseWorkflow.handleIssue(payload).catch(error => {
          logger.error('Error handling issue:', error);
        });

        res.status(202).json({ message: 'Webhook received' });
      } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Push webhook
    this.app.post('/webhooks/github/push', async (req, res) => {
      try {
        const payload = req.body;
        logger.info(`Received push webhook to ${payload.ref}`);
        
        // Handle push in background
        this.gooseWorkflow.handlePush(payload).catch(error => {
          logger.error('Error handling push:', error);
        });

        res.status(202).json({ message: 'Webhook received' });
      } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    logger.info('GitHub webhooks configured');
  }

  /**
   * Set up API endpoints
   */
  setupApiEndpoints() {
    // Get agent status
    this.app.get('/api/agents/goose/status', async (req, res) => {
      try {
        const status = await this.gooseAgent.getStatus();
        res.json(status);
      } catch (error) {
        logger.error('Error getting agent status:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get workflow status
    this.app.get('/api/workflows/goose/status', async (req, res) => {
      try {
        const status = await this.gooseWorkflow.getStatus();
        res.json(status);
      } catch (error) {
        logger.error('Error getting workflow status:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Execute a task manually
    this.app.post('/api/agents/goose/execute', async (req, res) => {
      try {
        const task = req.body;
        const result = await this.gooseAgent.execute(task);
        res.json(result);
      } catch (error) {
        logger.error('Error executing task:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Analyze code
    this.app.post('/api/goose/analyze', async (req, res) => {
      try {
        const { files, type, context } = req.body;
        const result = await this.gooseAgent.execute({
          type: 'code_analysis',
          input: { files, type, context }
        });
        res.json(result);
      } catch (error) {
        logger.error('Error analyzing code:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Generate code
    this.app.post('/api/goose/generate', async (req, res) => {
      try {
        const { prompt, language, style, context } = req.body;
        const result = await this.gooseAgent.execute({
          type: 'code_generation',
          input: { prompt, language, style, context }
        });
        res.json(result);
      } catch (error) {
        logger.error('Error generating code:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Review code
    this.app.post('/api/goose/review', async (req, res) => {
      try {
        const { files, focus, context } = req.body;
        const result = await this.gooseAgent.execute({
          type: 'code_review',
          input: { files, focus, context }
        });
        res.json(result);
      } catch (error) {
        logger.error('Error reviewing code:', error);
        res.status(500).json({ error: error.message });
      }
    });

    logger.info('API endpoints configured');
  }

  /**
   * Start the application server
   */
  async start() {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        logger.info(`Multi-Agent GitHub Automation server running on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Stop the application server
   */
  async stop() {
    logger.info('Stopping Multi-Agent GitHub Automation...');

    // Shutdown workflows
    if (this.gooseWorkflow) {
      await this.gooseWorkflow.shutdown();
    }

    // Shutdown agents
    if (this.gooseAgent) {
      await this.gooseAgent.shutdown();
    }

    // Close server
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }

    logger.info('Multi-Agent GitHub Automation stopped');
  }
}

// Create and start application if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new MultiAgentGitHubAutomation();
  
  app.start().catch(error => {
    logger.error('Failed to start application:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await app.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await app.stop();
    process.exit(0);
  });
}

export default MultiAgentGitHubAutomation;
