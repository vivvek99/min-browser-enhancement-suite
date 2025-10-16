/**
 * Goose Agent
 * 
 * Agent wrapper for Goose AI that integrates with the multi-agent framework.
 * Handles task routing, context management, and result processing.
 * 
 * @module goose-agent
 */

import winston from 'winston';
import { createGooseIntegration } from '../integrations/goose-integration.js';

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
    })
  ]
});

/**
 * Goose Agent Class
 * Implements the Agent interface for the multi-agent system
 */
class GooseAgent {
  constructor(config = {}) {
    this.name = 'goose';
    this.displayName = 'Goose AI Agent';
    this.version = '1.0.0';
    
    this.capabilities = [
      'code_generation',
      'code_analysis',
      'code_refactoring',
      'bug_fixing',
      'test_generation',
      'documentation_generation',
      'code_review',
      'improvement_suggestions',
      'pr_analysis'
    ];

    this.config = {
      enabled: config.enabled !== false,
      priority: config.priority || 5,
      timeout: config.timeout || 120000,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };

    // Initialize Goose integration
    this.goose = createGooseIntegration(config.goose || {});
    
    // Set up event handlers
    this.goose.on('connected', () => logger.info('Goose agent connected'));
    this.goose.on('disconnected', () => logger.info('Goose agent disconnected'));
    this.goose.on('error', (error) => logger.error('Goose agent error:', error));
    this.goose.on('taskCompleted', (data) => logger.info('Task completed:', data.task.type));
    this.goose.on('taskFailed', (data) => logger.error('Task failed:', data.task.type, data.error.message));

    this.initialized = false;
  }

  /**
   * Initialize the agent
   * @returns {Promise<boolean>}
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    if (!this.config.enabled) {
      logger.warn('Goose agent is disabled');
      return false;
    }

    try {
      logger.info('Initializing Goose agent...');
      const connected = await this.goose.connect();
      
      if (connected) {
        this.initialized = true;
        logger.info('Goose agent initialized successfully');
        return true;
      }
      
      throw new Error('Failed to connect to Goose');
    } catch (error) {
      logger.error('Failed to initialize Goose agent:', error.message);
      return false;
    }
  }

  /**
   * Shutdown the agent
   */
  async shutdown() {
    logger.info('Shutting down Goose agent...');
    await this.goose.disconnect();
    this.initialized = false;
    logger.info('Goose agent shut down');
  }

  /**
   * Check if agent can handle a specific task
   * @param {Object} task - Task to check
   * @returns {boolean}
   */
  canHandle(task) {
    if (!task || !task.type) {
      return false;
    }

    return this.capabilities.includes(task.type);
  }

  /**
   * Execute a task
   * @param {Object} task - Task to execute
   * @returns {Promise<Object>} Task result
   */
  async execute(task) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.canHandle(task)) {
      throw new Error(`Goose agent cannot handle task type: ${task.type}`);
    }

    logger.info(`Goose agent executing task: ${task.type}`);

    try {
      let result;

      switch (task.type) {
        case 'code_generation':
          result = await this.goose.generateCode(task.input);
          break;

        case 'code_analysis':
          result = await this.goose.analyzeCode(task.input);
          break;

        case 'code_refactoring':
          result = await this.goose.refactorCode(task.input);
          break;

        case 'bug_fixing':
          result = await this.goose.fixBugs(task.input);
          break;

        case 'test_generation':
          result = await this.goose.generateTests(task.input);
          break;

        case 'documentation_generation':
          result = await this.goose.generateDocumentation(task.input);
          break;

        case 'code_review':
          result = await this.goose.reviewCode(task.input);
          break;

        case 'improvement_suggestions':
          result = await this.goose.suggestImprovements(task.input);
          break;

        case 'pr_analysis':
          result = await this.goose.handlePullRequest(task.input.pr);
          break;

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      logger.info(`Goose agent completed task: ${task.type}`);
      
      return {
        success: true,
        agent: this.name,
        taskType: task.type,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Goose agent failed task: ${task.type}`, error.message);
      
      return {
        success: false,
        agent: this.name,
        taskType: task.type,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get agent status
   * @returns {Object} Agent status
   */
  async getStatus() {
    const healthy = await this.goose.isHealthy();
    
    return {
      name: this.name,
      displayName: this.displayName,
      version: this.version,
      initialized: this.initialized,
      enabled: this.config.enabled,
      healthy,
      capabilities: this.capabilities,
      connected: this.goose.connected,
      sessionActive: !!this.goose.sessionId
    };
  }

  /**
   * Get agent capabilities
   * @returns {Array<string>} List of capabilities
   */
  getCapabilities() {
    return [...this.capabilities];
  }

  /**
   * Get agent metadata
   * @returns {Object} Agent metadata
   */
  getMetadata() {
    return {
      name: this.name,
      displayName: this.displayName,
      version: this.version,
      description: 'AI-powered coding agent for code generation, analysis, and review',
      capabilities: this.capabilities,
      priority: this.config.priority,
      provider: 'Goose',
      documentation: 'https://github.com/block/goose'
    };
  }
}

/**
 * Create and configure Goose agent instance
 * @param {Object} config - Configuration options
 * @returns {GooseAgent} Goose agent instance
 */
export function createGooseAgent(config = {}) {
  return new GooseAgent(config);
}

export default GooseAgent;
