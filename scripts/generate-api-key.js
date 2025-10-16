#!/usr/bin/env node

/**
 * Tippen API Key Generator
 * 
 * Usage:
 *   node scripts/generate-api-key.js
 *   node scripts/generate-api-key.js --client "Acme Corp"
 *   node scripts/generate-api-key.js --type demo
 */

function generateApiKey(options = {}) {
  const { type = 'client', clientName = '' } = options;
  
  // Generate random string
  const randomString = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Generate timestamp
  const timestamp = Date.now();
  
  // Clean client name (remove spaces, special chars, lowercase)
  const cleanName = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  
  let apiKey;
  
  switch (type) {
    case 'demo':
      apiKey = `demo_tippen_2025_${randomString().substring(0, 16)}`;
      break;
    
    case 'test':
      apiKey = `test_${timestamp}_${randomString().substring(0, 12)}`;
      break;
    
    case 'client':
      if (cleanName) {
        apiKey = `client_${cleanName}_${timestamp}_${randomString().substring(0, 8)}`;
      } else {
        apiKey = `client_${timestamp}_${randomString().substring(0, 16)}`;
      }
      break;
    
    default:
      apiKey = `${type}_${timestamp}_${randomString().substring(0, 12)}`;
  }
  
  return apiKey;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type' && args[i + 1]) {
    options.type = args[i + 1];
    i++;
  } else if (args[i] === '--client' && args[i + 1]) {
    options.clientName = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Tippen API Key Generator

Usage:
  node scripts/generate-api-key.js [options]

Options:
  --type <type>       Type of API key (demo, test, client) [default: client]
  --client <name>     Client name (for client type keys)
  --help, -h          Show this help message

Examples:
  node scripts/generate-api-key.js
  node scripts/generate-api-key.js --type demo
  node scripts/generate-api-key.js --client "Acme Corporation"
  node scripts/generate-api-key.js --type test
    `);
    process.exit(0);
  }
}

// Generate and display the API key
const apiKey = generateApiKey(options);

console.log('\n🔑 Generated API Key:\n');
console.log(`   ${apiKey}`);
console.log('\n📋 Copy-paste integration code:\n');
console.log(`<script
  src="https://tippen.pages.dev/tippen-tracker.js"
  data-tippen-api-key="${apiKey}"
  data-tippen-backend="https://tippen-backend.benjiemalinao879557.workers.dev"
></script>`);
console.log('\n✅ Save this API key securely!\n');

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateApiKey };
}

