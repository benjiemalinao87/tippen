#!/usr/bin/env node

/**
 * Backfill changelog from git history
 * Usage: node scripts/backfill-changelog.js [--limit=50]
 */

import { execSync } from 'child_process';

const BACKEND_URL = process.env.BACKEND_URL || 'https://tippen-backend.benjiemalinao879557.workers.dev';

// Parse command line arguments
const args = process.argv.slice(2);
let limit = 50;

for (const arg of args) {
  if (arg.startsWith('--limit=')) {
    limit = parseInt(arg.split('=')[1], 10);
  }
}

function getGitLog(limit) {
  const format = '%H|%s|%an|%ai';
  const cmd = `git log --pretty=format:"${format}" -n ${limit}`;
  
  try {
    const output = execSync(cmd, { encoding: 'utf-8' });
    return output.split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Error running git log:', error.message);
    return [];
  }
}

function parseCommitLine(line) {
  const [hash, message, author, date] = line.split('|');
  return {
    commit_hash: hash.substring(0, 7),
    commit_message: message,
    title: parseTitle(message),
    description: null,
    author,
    created_at: date
  };
}

function parseTitle(message) {
  // Try to parse conventional commit format: type(scope): description
  const conventionalMatch = message.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
  
  if (conventionalMatch) {
    const [, type, scope, description] = conventionalMatch;
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    return scope 
      ? `${capitalizedType}: ${description} (${scope})`
      : `${capitalizedType}: ${description}`;
  }
  
  return message;
}

async function backfillChangelog() {
  console.log(`📋 Fetching last ${limit} commits from git history...`);
  
  const commits = getGitLog(limit);
  
  if (commits.length === 0) {
    console.log('No commits found.');
    return;
  }
  
  console.log(`Found ${commits.length} commits`);
  
  const entries = commits.map(parseCommitLine).filter(entry => {
    // Skip merge commits
    return !entry.commit_message.startsWith('Merge');
  });
  
  console.log(`\n📝 Preparing ${entries.length} changelog entries (excluding merge commits)...`);
  
  // Preview entries
  console.log('\nPreview:');
  entries.slice(0, 5).forEach((entry, i) => {
    console.log(`  ${i + 1}. [${entry.commit_hash}] ${entry.title}`);
  });
  if (entries.length > 5) {
    console.log(`  ... and ${entries.length - 5} more`);
  }
  
  // Send to backend
  console.log(`\n🚀 Sending to ${BACKEND_URL}/api/changelog/bulk...`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/changelog/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ entries })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`\n✅ Success!`);
      console.log(`   Created: ${result.created} entries`);
      console.log(`   Skipped: ${result.skipped} entries (already exist)`);
    } else {
      console.error(`\n❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error(`\n❌ Network error: ${error.message}`);
    console.log('\nMake sure the backend is deployed and accessible.');
  }
}

backfillChangelog();
