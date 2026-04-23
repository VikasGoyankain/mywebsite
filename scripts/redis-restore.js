#!/usr/bin/env node

/**
 * Redis Restore Script
 * 
 * Restores Redis data from a backup JSON file.
 * Can restore from a local file or directly from the GitHub backup repository.
 * 
 * Required Environment Variables:
 * - UPSTASH_REDIS_REST_URL: Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Redis REST API token
 * 
 * For GitHub restore (optional):
 * - BACKUP_REPO_TOKEN: GitHub PAT with repo scope
 * - BACKUP_REPO: GitHub repo in format "owner/repo"
 * 
 * Usage:
 *   node scripts/redis-restore.js <backup-file.json>
 *   node scripts/redis-restore.js --from-github [date]
 *   node scripts/redis-restore.js --from-github latest
 *   node scripts/redis-restore.js --from-github 2026-02-06
 *   npm run restore:redis -- backup.json
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  // Validate Redis environment variables
  const requiredEnvVars = ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  let backup;

  if (args[0] === '--from-github') {
    // Restore from GitHub
    const githubEnvVars = ['BACKUP_REPO_TOKEN', 'BACKUP_REPO'];
    const missingGitHub = githubEnvVars.filter(v => !process.env[v]);
    if (missingGitHub.length > 0) {
      console.error('❌ Missing GitHub environment variables:', missingGitHub.join(', '));
      process.exit(1);
    }

    const date = args[1] || 'latest';
    backup = await fetchFromGitHub(date);
  } else {
    // Restore from local file
    const filePath = path.resolve(args[0]);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Backup file not found: ${filePath}`);
      process.exit(1);
    }

    console.log(`📂 Loading backup from: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    backup = JSON.parse(content);
  }

  // Validate backup structure
  if (!backup.version || !backup.keyManifest) {
    console.error('❌ Invalid backup file format');
    process.exit(1);
  }

  // Display backup info
  console.log('\n📋 Backup Information:');
  console.log(`   Version: ${backup.version}`);
  console.log(`   Created: ${backup.createdAt}`);
  console.log(`   Simple keys: ${Object.keys(backup.simpleKeys || {}).length}`);
  console.log(`   Hash keys: ${Object.keys(backup.hashKeys || {}).length}`);
  console.log(`   Set keys: ${Object.keys(backup.setKeys || {}).length}`);
  console.log(`   Sorted set keys: ${Object.keys(backup.sortedSetKeys || {}).length}`);
  console.log(`   Total keys: ${backup.keyManifest.length}`);

  // Confirm before proceeding
  const confirmed = await confirm('\n⚠️  This will OVERWRITE existing data in Redis. Continue?');
  if (!confirmed) {
    console.log('❌ Restore cancelled');
    process.exit(0);
  }

  console.log('\n🔄 Starting restore...\n');

  try {
    const stats = await restoreBackup(redis, backup);
    
    console.log('\n✅ Restore completed successfully!');
    console.log(`   Restored: ${stats.simple} simple keys`);
    console.log(`   Restored: ${stats.hash} hash keys`);
    console.log(`   Restored: ${stats.set} set keys`);
    console.log(`   Restored: ${stats.zset} sorted set keys`);
    console.log(`   Restored: ${stats.list} list keys`);
    console.log(`   Failed: ${stats.failed} keys`);
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Redis Restore Script

Usage:
  node scripts/redis-restore.js <backup-file.json>
  node scripts/redis-restore.js --from-github [date|latest]

Examples:
  node scripts/redis-restore.js ./backups/backup-2026-02-06.json
  node scripts/redis-restore.js --from-github latest
  node scripts/redis-restore.js --from-github 2026-02-06

Environment Variables Required:
  UPSTASH_REDIS_REST_URL    Redis REST API URL
  UPSTASH_REDIS_REST_TOKEN  Redis REST API token
  
For --from-github:
  BACKUP_REPO_TOKEN         GitHub PAT with repo scope
  BACKUP_REPO               GitHub repo (owner/repo)
`);
}

async function fetchFromGitHub(date) {
  console.log(`📥 Fetching backup from GitHub...`);

  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({
    auth: process.env.BACKUP_REPO_TOKEN,
  });

  const [owner, repo] = process.env.BACKUP_REPO.split('/');

  if (date === 'latest') {
    // Get list of backups and find the most recent
    const { data: files } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'backups',
    });

    if (!Array.isArray(files) || files.length === 0) {
      console.error('❌ No backups found in repository');
      process.exit(1);
    }

    // Sort by date in filename (newest first)
    const backupFiles = files
      .filter(f => f.name.match(/backup-\d{4}-\d{2}-\d{2}\.json/))
      .sort((a, b) => b.name.localeCompare(a.name));

    if (backupFiles.length === 0) {
      console.error('❌ No valid backup files found');
      process.exit(1);
    }

    date = backupFiles[0].name.match(/backup-(\d{4}-\d{2}-\d{2})\.json/)[1];
    console.log(`   Found latest backup: ${date}`);
  }

  const filePath = `backups/backup-${date}.json`;

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    console.log(`   ✅ Downloaded ${filePath}`);
    return JSON.parse(content);
  } catch (error) {
    if (error.status === 404) {
      console.error(`❌ Backup not found: ${filePath}`);
    } else {
      console.error(`❌ Failed to fetch backup: ${error.message}`);
    }
    process.exit(1);
  }
}

async function restoreBackup(redis, backup) {
  const stats = { simple: 0, hash: 0, set: 0, zset: 0, list: 0, failed: 0 };

  // Process in order from manifest for consistency
  for (const entry of backup.keyManifest) {
    const { key, type } = entry;

    try {
      switch (type) {
        case 'string': {
          const value = backup.simpleKeys[key];
          if (value !== undefined) {
            await redis.set(key, value);
            stats.simple++;
            console.log(`   ✅ [string] ${key}`);
          }
          break;
        }

        case 'hash': {
          const value = backup.hashKeys[key];
          if (value && Object.keys(value).length > 0) {
            await redis.del(key); // Clear existing
            await redis.hset(key, value);
            stats.hash++;
            console.log(`   ✅ [hash] ${key} (${Object.keys(value).length} fields)`);
          }
          break;
        }

        case 'set': {
          const value = backup.setKeys[key];
          if (value && value.length > 0) {
            await redis.del(key); // Clear existing
            await redis.sadd(key, ...value);
            stats.set++;
            console.log(`   ✅ [set] ${key} (${value.length} members)`);
          }
          break;
        }

        case 'zset': {
          const value = backup.sortedSetKeys[key];
          if (value && value.length > 0) {
            await redis.del(key); // Clear existing
            // zrange with withScores returns alternating [member, score, member, score, ...]
            const args = [];
            for (let i = 0; i < value.length; i += 2) {
              args.push({ score: parseFloat(value[i + 1]), member: value[i] });
            }
            if (args.length > 0) {
              await redis.zadd(key, ...args);
            }
            stats.zset++;
            console.log(`   ✅ [zset] ${key} (${args.length} members)`);
          }
          break;
        }

        case 'list': {
          const data = backup.simpleKeys[key];
          if (data && data._type === 'list' && data.items && data.items.length > 0) {
            await redis.del(key); // Clear existing
            await redis.rpush(key, ...data.items);
            stats.list++;
            console.log(`   ✅ [list] ${key} (${data.items.length} items)`);
          }
          break;
        }

        default:
          console.warn(`   ⚠️  Unknown type "${type}" for key: ${key}`);
          stats.failed++;
      }
    } catch (error) {
      console.error(`   ❌ Failed to restore "${key}": ${error.message}`);
      stats.failed++;
    }
  }

  return stats;
}

function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Run the restore
main();
