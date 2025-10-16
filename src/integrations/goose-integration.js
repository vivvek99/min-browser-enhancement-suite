/**
 * Goose Integration Module
 * 
 * Integrates Goose AI coding agent with the GitHub automation system.
 * Goose is a developer-focused AI agent that can assist with:
 * - Code generation and refactoring
 * - Bug fixing and debugging
 * - Code review and analysis
 * - Documentation generation
 * - Test creation
 * 
 * @module goose-integration
 */

import axios from 'axios';
import { EventEmitter } from 'events';
import winston from 'winston';

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
 * Goose Integration Client
 * Handles communication with Goose AI agent
 */
class GooseIntegration extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      apiKey: config.apiKey || process.env.GOOSE_API_KEY,
      endpoint: config.endpoint || process.env.GOOSE_ENDPOINT || 'http://localhost:8080',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      enabled: config.enabled !== false,
      model: config.model || 'goose-default',
      temperature: config.temperature || 0.2,
      maxTokens: config.maxTokens || 4096,
      ...config
    };

    this.client = null;
    this.connected = false;
    this.sessionId = null;
  }

  /**
   * Initialize and connect to Goose
   * @returns {Promise<boolean>}
   */
  async connect() {
    if (!this.config.enabled) {
      logger.warn('Goose integration is disabled');
      return false;
    }

    if (this.connected) {
      logger.info('Already connected to Goose');
      return true;
    }

    try {
      logger.info('Connecting to Goose AI agent...');
      
      // Create axios client with configuration
      this.client = axios.create({
        baseURL: this.config.endpoint,
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Multi-Agent-GitHub-Automation/1.0',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      // Test connection
      const response = await this.client.get('/health');
      
      if (response.status === 200) {
        this.connected = true;
        logger.info('Successfully connected to Goose');
        this.emit('connected');
        return true;
      }
      
      throw new Error(`Unexpected response: ${response.status}`);
    } catch (error) {
      logger.error('Failed to connect to Goose:', error.message);
      this.connected = false;
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Disconnect from Goose
   */
  async disconnect() {
    if (this.sessionId) {
      try {
        await this.endSession();
      } catch (error) {
        logger.error('Error ending session:', error.message);
      }
    }

    this.connected = false;
    this.client = null;
    logger.info('Disconnected from Goose');
    this.emit('disconnected');
  }

  /**
   * Check if Goose is healthy
   * @returns {Promise<boolean>}
   */
  async isHealthy() {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error('Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Start a new Goose session
   * @param {Object} context - Session context (repo, branch, files, etc.)
   * @returns {Promise<string>} Session ID
   */
  async startSession(context = {}) {
    if (!this.connected) {
      throw new Error('Not connected to Goose');
    }

    try {
      const response = await this.client.post('/session/start', {
        context,
        model: this.config.model,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens
      });

      this.sessionId = response.data.sessionId;
      logger.info(`Started Goose session: ${this.sessionId}`);
      this.emit('sessionStarted', this.sessionId);
      
      return this.sessionId;
    } catch (error) {
      logger.error('Failed to start session:', error.message);
      throw error;
    }
  }

  /**
   * End the current Goose session
   */
  async endSession() {
    if (!this.sessionId) {
      return;
    }

    try {
      await this.client.post('/session/end', { sessionId: this.sessionId });
      logger.info(`Ended Goose session: ${this.sessionId}`);
      this.emit('sessionEnded', this.sessionId);
      this.sessionId = null;
    } catch (error) {
      logger.error('Failed to end session:', error.message);
      throw error;
    }
  }

  /**
   * Execute a task with Goose
   * @param {Object} task - Task specification
   * @returns {Promise<Object>} Task result
   */
  async executeTask(task) {
    if (!this.connected) {
      await this.connect();
    }

    if (!this.sessionId) {
      await this.startSession(task.context);
    }

    try {
      logger.info(`Executing task: ${task.type}`);
      
      const response = await this.client.post('/task/execute', {
        sessionId: this.sessionId,
        task: {
          type: task.type,
          description: task.description,
          input: task.input,
          parameters: task.parameters || {}
        }
      });

      const result = response.data;
      logger.info(`Task completed: ${task.type}`);
      this.emit('taskCompleted', { task, result });
      
      return result;
    } catch (error) {
      logger.error(`Task failed: ${task.type}`, error.message);
      this.emit('taskFailed', { task, error });
      throw error;
    }
  }

  /**
   * Analyze code with Goose
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeCode(options) {
    const { files, type = 'full', context = {} } = options;

    return this.executeTask({
      type: 'code_analysis',
      description: 'Analyze code for quality, security, and best practices',
      input: { files, analysisType: type },
      context
    });
  }

  /**
   * Generate code with Goose
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated code
   */
  async generateCode(options) {
    const { prompt, language, style = 'clean', context = {} } = options;

    return this.executeTask({
      type: 'code_generation',
      description: 'Generate new code based on requirements',
      input: { prompt, language, style },
      context
    });
  }

  /**
   * Refactor code with Goose
   * @param {Object} options - Refactoring options
   * @returns {Promise<Object>} Refactored code
   */
  async refactorCode(options) {
    const { code, goal, constraints = [], context = {} } = options;

    return this.executeTask({
      type: 'code_refactoring',
      description: 'Refactor code to improve quality and maintainability',
      input: { code, goal, constraints },
      context
    });
  }

  /**
   * Fix bugs with Goose
   * @param {Object} options - Bug fixing options
   * @returns {Promise<Object>} Fixed code
   */
  async fixBugs(options) {
    const { code, issues, context = {} } = options;

    return this.executeTask({
      type: 'bug_fixing',
      description: 'Identify and fix bugs in code',
      input: { code, issues },
      context
    });
  }

  /**
   * Generate tests with Goose
   * @param {Object} options - Test generation options
   * @returns {Promise<Object>} Generated tests
   */
  async generateTests(options) {
    const { code, framework = 'jest', coverage = 'full', context = {} } = options;

    return this.executeTask({
      type: 'test_generation',
      description: 'Generate unit tests for code',
      input: { code, framework, coverage },
      context
    });
  }

  /**
   * Generate documentation with Goose
   * @param {Object} options - Documentation options
   * @returns {Promise<Object>} Generated documentation
   */
  async generateDocumentation(options) {
    const { code, style = 'jsdoc', level = 'detailed', context = {} } = options;

    return this.executeTask({
      type: 'documentation_generation',
      description: 'Generate documentation for code',
      input: { code, style, level },
      context
    });
  }

  /**
   * Review code with Goose
   * @param {Object} options - Review options
   * @returns {Promise<Object>} Review comments
   */
  async reviewCode(options) {
    const { files, focus = ['quality', 'security', 'performance'], context = {} } = options;

    return this.executeTask({
      type: 'code_review',
      description: 'Review code and provide feedback',
      input: { files, focus },
      context
    });
  }

  /**
   * Suggest improvements with Goose
   * @param {Object} options - Suggestion options
   * @returns {Promise<Object>} Improvement suggestions
   */
  async suggestImprovements(options) {
    const { code, category = 'all', context = {} } = options;

    return this.executeTask({
      type: 'improvement_suggestions',
      description: 'Suggest improvements for code',
      input: { code, category },
      context
    });
  }

  /**
   * Handle GitHub pull request with Goose
   * @param {Object} pr - Pull request data
   * @returns {Promise<Object>} PR analysis and suggestions
   */
  async handlePullRequest(pr) {
    const context = {
      repository: pr.repository,
      branch: pr.head.ref,
      baseBranch: pr.base.ref,
      author: pr.user.login,
      title: pr.title,
      description: pr.body
    };

    // Start a session for this PR
    await this.startSession(context);

    try {
      // Get changed files
      const files = pr.files || [];

      // Analyze the changes
      const analysis = await this.analyzeCode({
        files: files.map(f => ({
          path: f.filename,
          content: f.patch,
          status: f.status
        })),
        type: 'pr_review',
        context
      });

      // Review the code
      const review = await this.reviewCode({
        files: files.map(f => ({
          path: f.filename,
          content: f.patch
        })),
        focus: ['quality', 'security', 'best-practices'],
        context
      });

      // Generate suggestions
      const suggestions = await this.suggestImprovements({
        code: files.map(f => f.patch).join('\n'),
        category: 'all',
        context
      });

      return {
        analysis,
        review,
        suggestions,
        sessionId: this.sessionId
      };
    } finally {
      await this.endSession();
    }
  }
}

/**
 * Create and configure Goose integration instance
 * @param {Object} config - Configuration options
 * @returns {GooseIntegration} Goose integration instance
 */
export function createGooseIntegration(config = {}) {
  return new GooseIntegration(config);
}

export default GooseIntegration;
