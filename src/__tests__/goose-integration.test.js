/**
 * Goose Integration Tests
 * 
 * Unit tests for Goose AI integration components
 */

import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('axios');
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

describe('Goose Integration', () => {
  let GooseIntegration;
  let axios;

  beforeAll(async () => {
    // Dynamically import after mocks are set up
    const module = await import('../integrations/goose-integration.js');
    GooseIntegration = module.default;
    axios = (await import('axios')).default;
  });

  describe('GooseIntegration Class', () => {
    let goose;

    beforeEach(() => {
      goose = new GooseIntegration({
        apiKey: 'test-key',
        endpoint: 'http://localhost:8080',
        enabled: true
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should initialize with correct config', () => {
      expect(goose.config.apiKey).toBe('test-key');
      expect(goose.config.endpoint).toBe('http://localhost:8080');
      expect(goose.config.enabled).toBe(true);
    });

    test('should not connect when disabled', async () => {
      const disabledGoose = new GooseIntegration({ enabled: false });
      const result = await disabledGoose.connect();
      expect(result).toBe(false);
    });

    test('should emit events on connection', async () => {
      const mockCreate = jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ status: 200 })
      }));
      axios.create = mockCreate;

      const connectListener = jest.fn();
      goose.on('connected', connectListener);

      await goose.connect();

      expect(connectListener).toHaveBeenCalled();
      expect(goose.connected).toBe(true);
    });

    test('should handle connection errors', async () => {
      const mockCreate = jest.fn(() => ({
        get: jest.fn().mockRejectedValue(new Error('Connection failed'))
      }));
      axios.create = mockCreate;

      const errorListener = jest.fn();
      goose.on('error', errorListener);

      const result = await goose.connect();

      expect(result).toBe(false);
      expect(goose.connected).toBe(false);
      expect(errorListener).toHaveBeenCalled();
    });

    test('should check health status', async () => {
      goose.connected = true;
      goose.client = {
        get: jest.fn().mockResolvedValue({ status: 200 })
      };

      const healthy = await goose.isHealthy();
      expect(healthy).toBe(true);
    });

    test('should return false when not connected for health check', async () => {
      goose.connected = false;
      const healthy = await goose.isHealthy();
      expect(healthy).toBe(false);
    });

    test('should start a session', async () => {
      goose.connected = true;
      goose.client = {
        post: jest.fn().mockResolvedValue({
          data: { sessionId: 'test-session-123' }
        })
      };

      const sessionId = await goose.startSession({ repo: 'test/repo' });
      
      expect(sessionId).toBe('test-session-123');
      expect(goose.sessionId).toBe('test-session-123');
    });

    test('should execute a task', async () => {
      goose.connected = true;
      goose.sessionId = 'test-session';
      goose.client = {
        post: jest.fn().mockResolvedValue({
          data: { result: 'success' }
        })
      };

      const task = {
        type: 'code_analysis',
        description: 'Test analysis',
        input: { files: [] }
      };

      const result = await goose.executeTask(task);
      
      expect(result).toEqual({ result: 'success' });
    });
  });
});

describe('Goose Agent', () => {
  let GooseAgent;

  beforeAll(async () => {
    const module = await import('../agents/goose-agent.js');
    GooseAgent = module.default;
  });

  describe('GooseAgent Class', () => {
    let agent;

    beforeEach(() => {
      agent = new GooseAgent({
        enabled: true,
        goose: {
          endpoint: 'http://localhost:8080'
        }
      });
    });

    test('should initialize with correct capabilities', () => {
      expect(agent.name).toBe('goose');
      expect(agent.capabilities).toContain('code_generation');
      expect(agent.capabilities).toContain('code_analysis');
      expect(agent.capabilities).toContain('code_review');
    });

    test('should check if can handle task', () => {
      const validTask = { type: 'code_analysis' };
      const invalidTask = { type: 'unknown_task' };

      expect(agent.canHandle(validTask)).toBe(true);
      expect(agent.canHandle(invalidTask)).toBe(false);
    });

    test('should return capabilities list', () => {
      const capabilities = agent.getCapabilities();
      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);
    });

    test('should return agent metadata', () => {
      const metadata = agent.getMetadata();
      expect(metadata.name).toBe('goose');
      expect(metadata.displayName).toBe('Goose AI Agent');
      expect(metadata.provider).toBe('Goose');
    });
  });
});

describe('Goose GitHub Workflow', () => {
  let GooseGitHubWorkflow;

  beforeAll(async () => {
    const module = await import('../workflows/goose-github-workflow.js');
    GooseGitHubWorkflow = module.default;
  });

  describe('GooseGitHubWorkflow Class', () => {
    let workflow;

    beforeEach(() => {
      workflow = new GooseGitHubWorkflow({
        githubToken: 'test-token',
        enabled: true,
        goose: {
          endpoint: 'http://localhost:8080'
        }
      });
    });

    test('should initialize with correct config', () => {
      expect(workflow.config.githubToken).toBe('test-token');
      expect(workflow.config.enabled).toBe(true);
    });

    test('should not initialize when disabled', async () => {
      const disabledWorkflow = new GooseGitHubWorkflow({ enabled: false });
      const result = await disabledWorkflow.initialize();
      expect(result).toBe(false);
    });
  });
});
