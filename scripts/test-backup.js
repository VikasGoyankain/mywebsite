#!/usr/bin/env node

/**
 * Test script to load .env.local and run the backup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env.local file
const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

console.log('📄 Loading .env.local...\n');
const envContent = fs.readFileSync(envPath, 'utf-8');

const envVars = {};
envContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  if (line.trim().startsWith('#') || !line.trim()) return;
  
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    envVars[key] = value;
  }
});

// Check required variables
const required = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'BACKUP_REPO_TOKEN',
  'BACKUP_REPO'
];

const missing = required.filter(v => !envVars[v]);
if (missing.length > 0) {
  console.error('❌ Missing required variables in .env.local:', missing.join(', '));
  console.error('\nPlease add these to your .env.local file:');
  missing.forEach(v => console.error(`   ${v}=your_value_here`));
  process.exit(1);
}

console.log('✅ All required variables found\n');

// Build environment string for PowerShell
const envString = Object.entries(envVars)
  .map(([k, v]) => `$env:${k}="${v.replace(/"/g, '`"')}"`)
  .join('; ');

// Run the backup script with environment variables
try {
  execSync(`${envString}; node scripts/redis-backup.js`, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: 'powershell.exe'
  });
} catch (error) {
  process.exit(error.status || 1);
}
