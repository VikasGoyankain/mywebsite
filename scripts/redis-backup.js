#!/usr/bin/env node

/**
 * Redis Backup Script
 * 
 * Exports all Redis data in a restorable format and pushes to a private GitHub repo.
 * Automatically deletes backups older than 7 days.
 * 
 * Required Environment Variables:
 * - UPSTASH_REDIS_REST_URL: Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Redis REST API token
 * - BACKUP_REPO_TOKEN: GitHub PAT with repo scope
 * - BACKUP_REPO: GitHub repo in format "owner/repo"
 * 
 * Usage:
 *   node scripts/redis-backup.js
 *   npm run backup:redis
 */

const BACKUP_RETENTION_DAYS = 7;

async function main() {
  console.log('🚀 Starting Redis backup...\n');

  // Validate environment variables
  const requiredEnvVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'BACKUP_REPO_TOKEN',
    'BACKUP_REPO'
  ];

  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Dynamic imports for ES modules
  const { Redis } = await import('@upstash/redis');
  const { Octokit } = await import('@octokit/rest');

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const octokit = new Octokit({
    auth: process.env.BACKUP_REPO_TOKEN,
  });

  const [owner, repo] = process.env.BACKUP_REPO.split('/');
  if (!owner || !repo) {
    console.error('❌ BACKUP_REPO must be in format "owner/repo"');
    process.exit(1);
  }

  try {
    // Step 1: Get all keys from Redis
    console.log('📋 Fetching all Redis keys...');
    const allKeys = await getAllKeys(redis);
    console.log(`   Found ${allKeys.length} keys\n`);

    if (allKeys.length === 0) {
      console.log('⚠️  No keys found in Redis. Nothing to backup.');
      return;
    }

    // Step 2: Export data by type
    console.log('📦 Exporting data...');
    const backup = await exportAllData(redis, allKeys);
    console.log(`   Exported: ${Object.keys(backup.simpleKeys).length} simple keys`);
    console.log(`   Exported: ${Object.keys(backup.hashKeys).length} hash keys`);
    console.log(`   Exported: ${Object.keys(backup.setKeys).length} set keys`);
    console.log(`   Exported: ${Object.keys(backup.sortedSetKeys).length} sorted set keys\n`);

    // Step 3: Create backup file content
    const today = new Date().toISOString().split('T')[0];
    const backupFileName = `backups/backup-${today}.json`;
    const backupContent = JSON.stringify(backup, null, 2);

    // Step 4: Push to GitHub
    console.log(`📤 Pushing backup to GitHub (${process.env.BACKUP_REPO})...`);
    await pushToGitHub(octokit, owner, repo, backupFileName, backupContent);
    console.log(`   ✅ Backup saved as ${backupFileName}\n`);

    // Step 5: Clean up old backups
    console.log('🧹 Cleaning up old backups...');
    const deletedCount = await cleanupOldBackups(octokit, owner, repo, BACKUP_RETENTION_DAYS);
    console.log(`   Deleted ${deletedCount} old backup(s)\n`);

    console.log('✅ Backup completed successfully!');

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Get all keys from Redis
 * Using KEYS * for simplicity - works fine for most use cases
 * For very large datasets (millions of keys), consider using SCAN
 */
async function getAllKeys(redis) {
  try {
    // For Upstash and most Redis setups, KEYS * is fine
    const keys = await redis.keys('*');
    return keys || [];
  } catch (error) {
    console.warn('   ⚠️  KEYS command failed, trying SCAN...');
    
    // Fallback to SCAN if KEYS is disabled
    const keys = [];
    let cursor = '0';
    let iterations = 0;
    const maxIterations = 1000; // Safety limit

    do {
      const result = await redis.scan(cursor, { count: 100 });
      cursor = String(result[0]); // Ensure cursor is string
      keys.push(...(result[1] || []));
      iterations++;
      
      if (iterations >= maxIterations) {
        console.warn('   ⚠️  SCAN reached max iterations, stopping');
        break;
      }
    } while (cursor !== '0');

    return [...new Set(keys)]; // Remove duplicates
  }
}

/**
 * Get the type of a Redis key
 */
async function getKeyType(redis, key) {
  try {
    const type = await redis.type(key);
    return type;
  } catch {
    return 'unknown';
  }
}

/**
 * Export all Redis data organized by type
 */
async function exportAllData(redis, keys) {
  const backup = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    source: 'mywebsite-redis-backup',
    simpleKeys: {},
    hashKeys: {},
    setKeys: {},
    sortedSetKeys: {},
    keyManifest: [],
  };

  // Process keys in batches to avoid overwhelming Redis
  const batchSize = 10;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (key) => {
      try {
        const type = await getKeyType(redis, key);
        
        switch (type) {
          case 'string': {
            const value = await redis.get(key);
            backup.simpleKeys[key] = value;
            backup.keyManifest.push({ key, type: 'string' });
            break;
          }
          
          case 'hash': {
            const value = await redis.hgetall(key);
            backup.hashKeys[key] = value || {};
            backup.keyManifest.push({ key, type: 'hash' });
            break;
          }
          
          case 'set': {
            const value = await redis.smembers(key);
            backup.setKeys[key] = value || [];
            backup.keyManifest.push({ key, type: 'set' });
            break;
          }
          
          case 'zset': {
            // Get all members with scores
            const value = await redis.zrange(key, 0, -1, { withScores: true });
            backup.sortedSetKeys[key] = value || [];
            backup.keyManifest.push({ key, type: 'zset' });
            break;
          }
          
          case 'list': {
            // Get all list items
            const value = await redis.lrange(key, 0, -1);
            backup.simpleKeys[key] = { _type: 'list', items: value || [] };
            backup.keyManifest.push({ key, type: 'list' });
            break;
          }
          
          default:
            console.warn(`   ⚠️  Unknown type "${type}" for key: ${key}`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Failed to export key "${key}": ${error.message}`);
      }
    }));
  }

  return backup;
}

/**
 * Push backup file to GitHub repository
 */
async function pushToGitHub(octokit, owner, repo, path, content) {
  const contentBase64 = Buffer.from(content).toString('base64');
  
  // Check if file already exists (to get SHA for update)
  let sha;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    sha = data.sha;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
    // File doesn't exist, will create new
  }

  // Create or update file
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `chore: Redis backup ${new Date().toISOString().split('T')[0]}`,
    content: contentBase64,
    sha,
  });
}

/**
 * Delete backup files older than retention period
 */
async function cleanupOldBackups(octokit, owner, repo, retentionDays) {
  let deletedCount = 0;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    // Get contents of backups folder
    const { data: files } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'backups',
    });

    if (!Array.isArray(files)) {
      return 0;
    }

    for (const file of files) {
      // Extract date from filename (backup-YYYY-MM-DD.json)
      const match = file.name.match(/backup-(\d{4}-\d{2}-\d{2})\.json/);
      if (!match) continue;

      const fileDate = new Date(match[1]);
      if (fileDate < cutoffDate) {
        try {
          await octokit.repos.deleteFile({
            owner,
            repo,
            path: file.path,
            message: `chore: Delete old backup ${file.name}`,
            sha: file.sha,
          });
          console.log(`   🗑️  Deleted ${file.name}`);
          deletedCount++;
        } catch (error) {
          console.warn(`   ⚠️  Failed to delete ${file.name}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    if (error.status === 404) {
      // Backups folder doesn't exist yet, that's fine
      return 0;
    }
    console.warn(`   ⚠️  Failed to list backups: ${error.message}`);
  }

  return deletedCount;
}

// Run the backup
main();
