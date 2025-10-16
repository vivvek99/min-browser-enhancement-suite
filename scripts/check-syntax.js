#!/usr/bin/env node
/**
 * Syntax checker for JavaScript files
 * Validates all .js files in the repository
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

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

function checkSyntax(filePath) {
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    return { success: true, file: filePath };
  } catch (error) {
    return { 
      success: false, 
      file: filePath, 
      error: error.message 
    };
  }
}

function main() {
  console.log('🔍 Checking JavaScript syntax...\n');
  
  const jsFiles = findJsFiles(process.cwd());
  console.log(`Found ${jsFiles.length} JavaScript files\n`);
  
  let hasErrors = false;
  
  jsFiles.forEach(file => {
    const result = checkSyntax(file);
    if (result.success) {
      console.log(`✅ ${file}`);
    } else {
      console.error(`❌ ${file}`);
      console.error(`   Error: ${result.error}`);
      hasErrors = true;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ Syntax check FAILED');
    process.exit(1);
  } else {
    console.log('✅ All JavaScript files have valid syntax');
    process.exit(0);
  }
}

main();
