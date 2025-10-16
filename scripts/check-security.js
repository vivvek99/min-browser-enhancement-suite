#!/usr/bin/env node
/**
 * Security checker for JavaScript files
 * Detects common security issues and vulnerabilities
 */

const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'scripts'];

const SECURITY_PATTERNS = [
  {
    name: 'eval() usage',
    pattern: /eval\s*\(/g,
    severity: 'HIGH',
    message: 'eval() can execute arbitrary code and is a security risk'
  },
  {
    name: 'innerHTML with unsanitized data',
    pattern: /innerHTML\s*=\s*[^;]*\$\{(?!.*escapeHtml)/g,
    severity: 'HIGH',
    message: 'Unsanitized data in innerHTML can lead to XSS'
  },
  {
    name: 'document.write',
    pattern: /document\.write\s*\(/g,
    severity: 'MEDIUM',
    message: 'document.write can be used for XSS attacks'
  }
];

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        findJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  SECURITY_PATTERNS.forEach(pattern => {
    const matches = content.matchAll(pattern.pattern);
    for (const match of matches) {
      const lines = content.substring(0, match.index).split('\n');
      const lineNumber = lines.length;
      
      issues.push({
        file: filePath,
        line: lineNumber,
        severity: pattern.severity,
        name: pattern.name,
        message: pattern.message
      });
    }
  });
  
  return issues;
}

function main() {
  console.log('🔒 Checking for security issues...\n');
  
  const jsFiles = findJsFiles(process.cwd());
  console.log(`Scanning ${jsFiles.length} JavaScript files\n`);
  
  let allIssues = [];
  
  jsFiles.forEach(file => {
    const issues = checkFile(file);
    allIssues = allIssues.concat(issues);
  });
  
  if (allIssues.length === 0) {
    console.log('✅ No security issues detected');
    process.exit(0);
  }
  
  console.log(`⚠️  Found ${allIssues.length} potential security issue(s):\n`);
  
  allIssues.forEach(issue => {
    const icon = issue.severity === 'HIGH' ? '🔴' : '🟡';
    console.log(`${icon} [${issue.severity}] ${issue.name}`);
    console.log(`   File: ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}\n`);
  });
  
  const highSeverityCount = allIssues.filter(i => i.severity === 'HIGH').length;
  
  console.log('='.repeat(50));
  if (highSeverityCount > 0) {
    console.log(`❌ Found ${highSeverityCount} HIGH severity issue(s)`);
    console.log('ℹ️  Review and fix these issues before merging');
    process.exit(0); // Don't fail build, just warn
  } else {
    console.log('✅ No HIGH severity issues found');
    process.exit(0);
  }
}

main();
