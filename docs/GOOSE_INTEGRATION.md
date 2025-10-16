# Goose Integration Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Workflows](#workflows)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

## Introduction

Goose is an AI-powered coding agent developed by Block (formerly Square) that helps developers with various coding tasks. This integration brings Goose's capabilities into the GitHub automation ecosystem, enabling automated code review, generation, and analysis.

### Key Features

- **Automated Code Review**: Analyze pull requests and provide intelligent feedback
- **Code Generation**: Generate code from natural language descriptions
- **Bug Detection**: Identify potential bugs and security issues
- **Test Generation**: Create comprehensive test suites automatically
- **Documentation**: Generate high-quality documentation
- **Refactoring**: Suggest and implement code improvements

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Events                             │
│  (Pull Requests, Issues, Pushes)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Goose GitHub Workflow                          │
│  - Event handling                                           │
│  - Task routing                                             │
│  - Result formatting                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Goose Agent                                  │
│  - Task execution                                           │
│  - Capability checking                                      │
│  - Status monitoring                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Goose Integration                              │
│  - Low-level API communication                              │
│  - Session management                                       │
│  - Connection handling                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Goose AI Service                           │
│  (Local or Remote)                                          │
└─────────────────────────────────────────────────────────────┘
```

## Installation

See [Integration README](../src/integrations/README.md) for detailed installation instructions.

Quick start:
```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## Configuration

See `src/config/goose-config.js` for all configuration options.

## API Reference

### REST Endpoints

- `GET /health` - Health check
- `GET /api/agents/goose/status` - Get agent status
- `POST /api/goose/analyze` - Analyze code
- `POST /api/goose/generate` - Generate code
- `POST /api/goose/review` - Review code

### Webhooks

- `POST /webhooks/github/pull_request` - Handle PR events
- `POST /webhooks/github/issues` - Handle issue events
- `POST /webhooks/github/push` - Handle push events

## Examples

See the [Integration README](../src/integrations/README.md) for comprehensive examples.

## Support

For issues and questions, please open an issue on GitHub.
