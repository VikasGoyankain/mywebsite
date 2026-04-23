#!/usr/bin/env node

/**
 * Next.js Version Sync Utility
 * Ensures @next/swc versions match Next.js version
 * Run this script if you see version mismatch warnings
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking Next.js configuration...\n');

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get Next.js version
let nextVersion = packageJson.dependencies.next;
const hasCaretOrTilde = nextVersion.startsWith('^') || nextVersion.startsWith('~');

if (hasCaretOrTilde) {
  console.log(`⚠️  Found flexible version specifier: ${nextVersion}`);
  console.log('📌 Removing version prefix to use exact version...\n');
  
  // Remove ^ or ~
  nextVersion = nextVersion.replace(/^[\^~]/, '');
  packageJson.dependencies.next = nextVersion;
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated Next.js to exact version: ${nextVersion}\n`);
  
  console.log('🧹 Cleaning Next.js installation...');
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      execSync('if exist node_modules\\next rmdir /s /q node_modules\\next', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } else {
      execSync('rm -rf node_modules/next', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    }
    console.log('✅ Cleanup complete\n');
  } catch (error) {
    console.log('⚠️  Cleanup had some issues, continuing...\n');
  }
  
  console.log('📥 Reinstalling dependencies...');
  try {
    execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('\n✅ Dependencies reinstalled successfully!');
  } catch (error) {
    console.error('\n❌ Error during installation:', error.message);
    process.exit(1);
  }
} else {
  console.log(`✅ Next.js already using exact version: ${nextVersion}`);
  console.log('✅ No version mismatch should occur');
}

console.log('\n✨ Next.js and @next/swc versions are now synchronized!');
console.log('\n🚀 You can now run: npm run dev\n');
