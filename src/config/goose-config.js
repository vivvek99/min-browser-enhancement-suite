/**
 * Goose Integration Configuration
 * 
 * Configuration options for Goose AI agent integration with GitHub automation.
 */

export const gooseConfig = {
  // Goose API configuration
  goose: {
    enabled: true,
    apiKey: process.env.GOOSE_API_KEY || '',
    endpoint: process.env.GOOSE_ENDPOINT || 'http://localhost:8080',
    timeout: 30000,
    maxRetries: 3,
    
    // Model configuration
    model: process.env.GOOSE_MODEL || 'goose-default',
    temperature: 0.2,
    maxTokens: 4096,
  },

  // Agent configuration
  agent: {
    enabled: true,
    priority: 5,
    timeout: 120000,
    retryAttempts: 3,
  },

  // GitHub workflow configuration
  workflow: {
    enabled: true,
    githubToken: process.env.GITHUB_TOKEN || '',
    
    // Auto-actions
    autoReview: true,
    autoComment: true,
    autoLabel: true,
    
    // Review triggers
    reviewOnPROpen: true,
    reviewOnPRUpdate: true,
    reviewOnCommit: false,
    
    // Comment triggers
    commentOnIssue: true,
    commentOnPR: true,
    
    // Label configuration
    labels: {
      securityReview: 'security-review-needed',
      highComplexity: 'high-complexity',
      performanceReview: 'performance-review-needed',
      needsTests: 'needs-tests',
      needsDocumentation: 'needs-documentation'
    }
  },

  // Task-specific configuration
  tasks: {
    codeAnalysis: {
      enabled: true,
      includeMetrics: true,
      checkSecurity: true,
      checkPerformance: true,
      checkBestPractices: true
    },
    
    codeReview: {
      enabled: true,
      focusAreas: ['quality', 'security', 'performance', 'best-practices'],
      includeLineComments: true,
      includeSuggestions: true,
      maxComments: 50
    },
    
    codeGeneration: {
      enabled: true,
      style: 'clean',
      includeExplanation: true,
      includeTests: false
    },
    
    testGeneration: {
      enabled: true,
      framework: 'jest',
      coverage: 'full',
      includeEdgeCases: true
    },
    
    documentation: {
      enabled: true,
      style: 'jsdoc',
      level: 'detailed',
      includeExamples: true
    },
    
    refactoring: {
      enabled: true,
      preserveApi: true,
      includeExplanation: true
    },
    
    bugFixing: {
      enabled: true,
      includeTests: true,
      explainFix: true
    }
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    includeTimestamp: true
  },

  // Feature flags
  features: {
    parallelProcessing: true,
    contextAwareness: true,
    learningFromFeedback: false,
    customPrompts: false
  }
};

export default gooseConfig;
