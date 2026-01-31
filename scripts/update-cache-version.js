#!/usr/bin/env node

/**
 * Cache Busting Utility Script
 * Run this script after deploying updates to force cache refresh
 * Usage: node scripts/update-cache-version.js
 */

const fs = require('fs');
const path = require('path');

// Update service worker cache version
const swPath = path.join(__dirname, '../public/sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Extract current version and increment
const versionMatch = swContent.match(/const CACHE_VERSION = '(\d+\.\d+)'/);
if (versionMatch) {
  const currentVersion = parseFloat(versionMatch[1]);
  const newVersion = (currentVersion + 0.1).toFixed(1);
  swContent = swContent.replace(
    /const CACHE_VERSION = '\d+\.\d+'/,
    `const CACHE_VERSION = '${newVersion}'`
  );
  fs.writeFileSync(swPath, swContent);
  console.log(`✅ Updated service worker cache version to ${newVersion}`);
} else {
  console.log('❌ Could not find CACHE_VERSION in sw.js');
}

// Update the cache name with timestamp
swContent = swContent.replace(
  /const CACHE_NAME = 'blog-cache-v' \+ Date\.now\(\);/,
  `const CACHE_NAME = 'blog-cache-v' + ${Date.now()};`
);

// Create a version file for reference
const versionInfo = {
  lastUpdated: new Date().toISOString(),
  timestamp: Date.now(),
  version: versionMatch ? parseFloat(versionMatch[1]) + 0.1 : '1.0'
};

const versionPath = path.join(__dirname, '../public/version.json');
fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
console.log('✅ Created version.json file');

console.log('\n📋 Cache busting steps completed:');
console.log('1. Service worker version updated');
console.log('2. Version file created');
console.log('\n🚀 Next steps:');
console.log('1. Build your application: npm run build');
console.log('2. Deploy the updated files');
console.log('3. Users will automatically get fresh content on next visit\n');
