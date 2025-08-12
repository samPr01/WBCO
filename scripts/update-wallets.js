#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// New wallet addresses to update
const NEW_WALLET_ADDRESSES = {
  BTC: 'bc1qr63h7nzs0lhzumk2stg7fneymwceu2y7erd96l',
  USDT: 'TQbchYKr8FbXCVPNTtDVdrfGYKiUnkJVnY',
  Ethereum: '0x2499aDe1b915E12819e8E38B1d915E12819e8E38B1d9ed3493107E2B1'
};

async function updateWalletConfig() {
  try {
    log('🚀 Starting wallet configuration update...', 'cyan');
    
    // Determine the config file path
    const configPath = path.join(process.cwd(), 'config', 'wallets.json');
    
    // Check if config directory exists, create if not
    const configDir = path.dirname(configPath);
    try {
      await fs.access(configDir);
    } catch {
      logInfo('Creating config directory...');
      await fs.mkdir(configDir, { recursive: true });
    }
    
    // Read existing configuration or create new one
    let config = {};
    try {
      const existingConfig = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(existingConfig);
      logInfo('Found existing wallet configuration');
    } catch (error) {
      if (error.code === 'ENOENT') {
        logInfo('No existing configuration found, creating new one');
        config = {
          wallets: {},
          updatedAt: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        };
      } else {
        throw new Error(`Failed to read existing config: ${error.message}`);
      }
    }
    
    // Store old addresses for comparison
    const oldAddresses = { ...config.wallets };
    
    // Update wallet addresses
    config.wallets = {
      ...config.wallets,
      ...NEW_WALLET_ADDRESSES
    };
    
    // Update metadata
    config.updatedAt = new Date().toISOString();
    config.environment = process.env.NODE_ENV || 'development';
    
    // Save updated configuration
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    logSuccess('Wallet configuration updated successfully!');
    
    // Log the updated addresses
    log('\n📋 Updated Wallet Addresses:', 'cyan');
    log('='.repeat(50), 'cyan');
    
    Object.entries(NEW_WALLET_ADDRESSES).forEach(([currency, address]) => {
      const oldAddress = oldAddresses[currency];
      const changed = oldAddress && oldAddress !== address;
      
      log(`${currency}:`, 'blue');
      log(`  ${address}`, 'green');
      
      if (changed) {
        log(`  (Changed from: ${oldAddress})`, 'yellow');
      } else if (oldAddress) {
        log(`  (No change)`, 'blue');
      } else {
        log(`  (New address)`, 'green');
      }
      console.log();
    });
    
    // Log file location
    log(`📁 Configuration saved to: ${configPath}`, 'cyan');
    
    // Log environment info
    log(`🌍 Environment: ${config.environment}`, 'cyan');
    log(`⏰ Updated at: ${config.updatedAt}`, 'cyan');
    
    logSuccess('Wallet configuration update completed!');
    
  } catch (error) {
    logError(`Failed to update wallet configuration: ${error.message}`);
    process.exit(1);
  }
}

// Validate environment variables
function validateEnvironment() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
  
  log('🔧 Environment Configuration:', 'cyan');
  Object.entries(envVars).forEach(([key, value]) => {
    log(`  ${key}: ${value}`, 'blue');
  });
  console.log();
}

// Main execution
async function main() {
  try {
    log('='.repeat(60), 'cyan');
    log('🔧 WBCO Wallet Configuration Updater', 'cyan');
    log('='.repeat(60), 'cyan');
    
    validateEnvironment();
    await updateWalletConfig();
    
    log('='.repeat(60), 'cyan');
    log('✅ Update completed successfully!', 'green');
    log('='.repeat(60), 'cyan');
    
  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { updateWalletConfig, NEW_WALLET_ADDRESSES };
