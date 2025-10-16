/**
 * Goose GitHub Workflow
 * 
 * Integrates Goose AI agent with GitHub workflows for automated
 * code review, PR analysis, and intelligent assistance.
 * 
 * @module goose-github-workflow
 */

import { Octokit } from '@octokit/rest';
import winston from 'winston';
import { createGooseAgent } from '../agents/goose-agent.js';

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
 * Goose GitHub Workflow Manager
 */
class GooseGitHubWorkflow {
  constructor(config = {}) {
    this.config = {
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
      enabled: config.enabled !== false,
      autoReview: config.autoReview !== false,
      autoComment: config.autoComment !== false,
      autoLabel: config.autoLabel !== false,
      ...config
    };

    // Initialize Octokit
    this.octokit = new Octokit({
      auth: this.config.githubToken,
      userAgent: 'Multi-Agent-GitHub-Automation/1.0'
    });

    // Initialize Goose agent
    this.gooseAgent = createGooseAgent(config.goose || {});

    this.initialized = false;
  }

  /**
   * Initialize the workflow manager
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    if (!this.config.enabled) {
      logger.warn('Goose GitHub workflow is disabled');
      return false;
    }

    try {
      logger.info('Initializing Goose GitHub workflow...');
      
      // Initialize Goose agent
      await this.gooseAgent.initialize();
      
      this.initialized = true;
      logger.info('Goose GitHub workflow initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Goose GitHub workflow:', error.message);
      return false;
    }
  }

  /**
   * Handle pull request opened/updated event
   * @param {Object} payload - GitHub webhook payload
   */
  async handlePullRequest(payload) {
    const { action, pull_request, repository } = payload;

    logger.info(`Handling PR ${action}: ${repository.full_name}#${pull_request.number}`);

    try {
      // Get PR files
      const { data: files } = await this.octokit.pulls.listFiles({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: pull_request.number
      });

      // Add files to PR object
      pull_request.files = files;
      pull_request.repository = repository;

      // Analyze PR with Goose
      const task = {
        type: 'pr_analysis',
        input: { pr: pull_request },
        context: {
          repository: repository.full_name,
          prNumber: pull_request.number,
          action
        }
      };

      const result = await this.gooseAgent.execute(task);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Post review comments if enabled
      if (this.config.autoComment && result.result.review) {
        await this.postReviewComments(repository, pull_request, result.result.review);
      }

      // Add labels based on analysis
      if (this.config.autoLabel && result.result.analysis) {
        await this.addAnalysisLabels(repository, pull_request, result.result.analysis);
      }

      // Post summary comment
      await this.postSummaryComment(repository, pull_request, result.result);

      logger.info(`Successfully processed PR ${repository.full_name}#${pull_request.number}`);
      
      return result;
    } catch (error) {
      logger.error(`Failed to handle PR ${repository.full_name}#${pull_request.number}:`, error.message);
      throw error;
    }
  }

  /**
   * Post review comments from Goose analysis
   * @param {Object} repository - Repository info
   * @param {Object} pr - Pull request info
   * @param {Object} review - Review data from Goose
   */
  async postReviewComments(repository, pr, review) {
    if (!review.comments || review.comments.length === 0) {
      return;
    }

    try {
      const comments = review.comments.map(comment => ({
        path: comment.file,
        position: comment.line,
        body: `🦢 **Goose Review**\n\n${comment.message}\n\n${comment.suggestion ? `**Suggestion:**\n\`\`\`${comment.language || 'javascript'}\n${comment.suggestion}\n\`\`\`` : ''}`
      }));

      await this.octokit.pulls.createReview({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: pr.number,
        event: 'COMMENT',
        comments
      });

      logger.info(`Posted ${comments.length} review comments for PR #${pr.number}`);
    } catch (error) {
      logger.error('Failed to post review comments:', error.message);
    }
  }

  /**
   * Add labels based on Goose analysis
   * @param {Object} repository - Repository info
   * @param {Object} pr - Pull request info
   * @param {Object} analysis - Analysis data from Goose
   */
  async addAnalysisLabels(repository, pr, analysis) {
    const labels = [];

    // Determine labels based on analysis
    if (analysis.hasSecurityIssues) {
      labels.push('security-review-needed');
    }

    if (analysis.complexityScore && analysis.complexityScore > 7) {
      labels.push('high-complexity');
    }

    if (analysis.hasPerformanceIssues) {
      labels.push('performance-review-needed');
    }

    if (analysis.needsTests) {
      labels.push('needs-tests');
    }

    if (analysis.needsDocumentation) {
      labels.push('needs-documentation');
    }

    if (labels.length > 0) {
      try {
        await this.octokit.issues.addLabels({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: pr.number,
          labels
        });

        logger.info(`Added labels to PR #${pr.number}: ${labels.join(', ')}`);
      } catch (error) {
        logger.error('Failed to add labels:', error.message);
      }
    }
  }

  /**
   * Post summary comment with Goose analysis results
   * @param {Object} repository - Repository info
   * @param {Object} pr - Pull request info
   * @param {Object} result - Analysis result from Goose
   */
  async postSummaryComment(repository, pr, result) {
    const { analysis, review, suggestions } = result;

    let comment = '## 🦢 Goose AI Review\n\n';

    // Add analysis summary
    if (analysis) {
      comment += '### Analysis Summary\n\n';
      comment += `- **Files Changed:** ${pr.files.length}\n`;
      comment += `- **Complexity Score:** ${analysis.complexityScore || 'N/A'}/10\n`;
      comment += `- **Security Issues:** ${analysis.hasSecurityIssues ? '⚠️ Yes' : '✅ None detected'}\n`;
      comment += `- **Performance Issues:** ${analysis.hasPerformanceIssues ? '⚠️ Yes' : '✅ None detected'}\n`;
      comment += `- **Test Coverage:** ${analysis.testCoverage || 'Unknown'}\n\n`;
    }

    // Add review highlights
    if (review && review.highlights) {
      comment += '### Review Highlights\n\n';
      review.highlights.forEach(highlight => {
        const emoji = highlight.type === 'positive' ? '✅' : '⚠️';
        comment += `${emoji} ${highlight.message}\n`;
      });
      comment += '\n';
    }

    // Add suggestions
    if (suggestions && suggestions.items && suggestions.items.length > 0) {
      comment += '### Improvement Suggestions\n\n';
      suggestions.items.slice(0, 5).forEach((suggestion, index) => {
        comment += `${index + 1}. **${suggestion.title}**\n`;
        comment += `   ${suggestion.description}\n\n`;
      });
      
      if (suggestions.items.length > 5) {
        comment += `*... and ${suggestions.items.length - 5} more suggestions*\n\n`;
      }
    }

    comment += '\n---\n';
    comment += '*This review was automatically generated by Goose AI. Please review the suggestions and apply them as appropriate.*';

    try {
      await this.octokit.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pr.number,
        body: comment
      });

      logger.info(`Posted summary comment for PR #${pr.number}`);
    } catch (error) {
      logger.error('Failed to post summary comment:', error.message);
    }
  }

  /**
   * Handle issue opened/updated event
   * @param {Object} payload - GitHub webhook payload
   */
  async handleIssue(payload) {
    const { action, issue, repository } = payload;

    logger.info(`Handling issue ${action}: ${repository.full_name}#${issue.number}`);

    // Check if issue asks for code generation or help
    const needsCodeGeneration = /generate|create|write|implement/i.test(issue.title + ' ' + issue.body);

    if (!needsCodeGeneration) {
      return;
    }

    try {
      // Analyze the issue and generate code if appropriate
      const task = {
        type: 'code_generation',
        input: {
          prompt: `${issue.title}\n\n${issue.body}`,
          context: {
            repository: repository.full_name,
            issueNumber: issue.number
          }
        }
      };

      const result = await this.gooseAgent.execute(task);

      if (result.success && result.result.code) {
        // Post code suggestion as comment
        const comment = '## 🦢 Goose Code Suggestion\n\n' +
          'Here\'s a code implementation based on your request:\n\n' +
          `\`\`\`${result.result.language || 'javascript'}\n${result.result.code}\n\`\`\`\n\n` +
          (result.result.explanation ? `**Explanation:**\n${result.result.explanation}\n\n` : '') +
          '---\n' +
          '*This code was automatically generated by Goose AI. Please review and test before using.*';

        await this.octokit.issues.createComment({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: issue.number,
          body: comment
        });

        logger.info(`Posted code suggestion for issue #${issue.number}`);
      }
    } catch (error) {
      logger.error(`Failed to handle issue ${repository.full_name}#${issue.number}:`, error.message);
    }
  }

  /**
   * Handle push event
   * @param {Object} payload - GitHub webhook payload
   */
  async handlePush(payload) {
    const { ref, repository, commits } = payload;

    logger.info(`Handling push to ${repository.full_name}:${ref} (${commits.length} commits)`);

    // Could analyze commits for issues, generate documentation, etc.
    // This is a placeholder for future enhancements
  }

  /**
   * Get workflow status
   */
  async getStatus() {
    const agentStatus = await this.gooseAgent.getStatus();
    
    return {
      initialized: this.initialized,
      enabled: this.config.enabled,
      agent: agentStatus,
      features: {
        autoReview: this.config.autoReview,
        autoComment: this.config.autoComment,
        autoLabel: this.config.autoLabel
      }
    };
  }

  /**
   * Shutdown workflow manager
   */
  async shutdown() {
    logger.info('Shutting down Goose GitHub workflow...');
    await this.gooseAgent.shutdown();
    this.initialized = false;
  }
}

/**
 * Create and configure Goose GitHub workflow instance
 * @param {Object} config - Configuration options
 * @returns {GooseGitHubWorkflow} Workflow instance
 */
export function createGooseGitHubWorkflow(config = {}) {
  return new GooseGitHubWorkflow(config);
}

export default GooseGitHubWorkflow;
