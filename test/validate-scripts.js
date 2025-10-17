#!/usr/bin/env node

/**
 * Validation script for Min Browser Enhancement Suite
 * Checks syntax and structure of all userscripts and adapters
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}=== Min Browser Enhancement Suite Validation ===${colors.reset}\n`);

let hasErrors = false;

// Files to validate
const filesToValidate = [
  'gpt-copy-14.js',
  'auto-inwindow-fullscreen-quality-lock.js',
  'site-adapters/ExampleAdapter.js',
  'userscripts/gpt-copy-14.js',
  'userscripts/auto-inwindow-fullscreen-quality-lock.js',
  'userscripts/site-adapters/ExampleAdapter.js',
];

// Check file existence
console.log(`${colors.yellow}Checking file existence...${colors.reset}`);
filesToValidate.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  try {
    fs.accessSync(fullPath, fs.constants.R_OK);
    console.log(`  ${colors.green}✓${colors.reset} ${file}`);
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} ${file} - File not found or not readable`);
    hasErrors = true;
  }
});

// Check syntax by attempting to require
console.log(`\n${colors.yellow}Checking JavaScript syntax...${colors.reset}`);
filesToValidate.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Basic syntax check - try to parse as JS
      new Function(content); // This will throw if syntax is invalid
      console.log(`  ${colors.green}✓${colors.reset} ${file}`);
    }
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} ${file} - Syntax error: ${error.message}`);
    hasErrors = true;
  }
});

// Check for UserScript headers in main userscripts
console.log(`\n${colors.yellow}Checking UserScript headers...${colors.reset}`);
const userscriptFiles = [
  'gpt-copy-14.js',
  'auto-inwindow-fullscreen-quality-lock.js',
  'userscripts/gpt-copy-14.js',
  'userscripts/auto-inwindow-fullscreen-quality-lock.js',
];

userscriptFiles.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('// ==UserScript==') && content.includes('// ==/UserScript==')) {
        console.log(`  ${colors.green}✓${colors.reset} ${file} - Valid UserScript header`);
      } else {
        console.warn(`  ${colors.yellow}⚠${colors.reset} ${file} - Missing UserScript header`);
      }
    }
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} ${file} - Error reading file`);
    hasErrors = true;
  }
});

// Check README files
console.log(`\n${colors.yellow}Checking documentation...${colors.reset}`);
const docFiles = ['README.md', 'site-adapters/README.md', 'userscripts/site-adapters/README.md'];
docFiles.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  try {
    fs.accessSync(fullPath, fs.constants.R_OK);
    console.log(`  ${colors.green}✓${colors.reset} ${file}`);
  } catch (error) {
    console.warn(`  ${colors.yellow}⚠${colors.reset} ${file} - Not found (optional)`);
  }
});

// Summary
console.log(`\n${colors.blue}=== Validation Summary ===${colors.reset}`);
if (hasErrors) {
  console.log(`${colors.red}✗ Validation failed - please fix the errors above${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✓ All checks passed!${colors.reset}`);
  console.log(`\n${colors.blue}The Min Browser Enhancement Suite is ready to use.${colors.reset}`);
  process.exit(0);
}
