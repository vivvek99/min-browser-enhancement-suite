/**
 * Syntax Validation Tests
 * Ensures all userscripts have valid JavaScript syntax
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Userscript Syntax Validation', () => {
  const scriptFiles = [
    'gpt-copy-14.js',
    'auto-inwindow-fullscreen-quality-lock.js'
  ];

  scriptFiles.forEach(file => {
    test(`${file} should have valid JavaScript syntax`, () => {
      const filePath = join(process.cwd(), file);
      
      // Check if file exists
      expect(existsSync(filePath)).toBe(true);
      
      // Validate syntax using Node.js --check flag
      expect(() => {
        execSync(`node --check "${filePath}"`, { encoding: 'utf-8' });
      }).not.toThrow();
    });
  });
});

describe('Userscript Directory Validation', () => {
  test('userscripts directory should exist', () => {
    const userscriptsPath = join(process.cwd(), 'userscripts');
    expect(existsSync(userscriptsPath)).toBe(true);
  });

  test('site-adapters directory should exist', () => {
    const siteAdaptersPath = join(process.cwd(), 'site-adapters');
    expect(existsSync(siteAdaptersPath)).toBe(true);
  });
});
