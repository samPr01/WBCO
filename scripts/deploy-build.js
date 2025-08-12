#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logStep(step) {
  log(`\n🚀 ${step}`, 'cyan');
}

// Configuration
const CONFIG = {
  build: {
    command: 'npm run build',
    timeout: 300000, // 5 minutes
    maxSize: 1024 * 1024 // 1MB in bytes
  },
  git: {
    commitMessage: 'Build ready for deployment',
    dryRun: process.argv.includes('--dry-run')
  },
  outputFolders: ['dist', 'build', 'out', 'public']
};

class DeployBuildRunner {
  constructor() {
    this.buildSize = 0;
    this.buildPath = null;
    this.originalDir = process.cwd();
  }

  async run() {
    log('🚀 Starting Deploy Build Process...', 'bright');
    log('='.repeat(60), 'bright');
    
    try {
      // Step 1: Run build command
      await this.runBuild();
      
      // Step 2: Analyze build size
      await this.analyzeBuildSize();
      
      // Step 3: Prepare Git for deployment
      await this.prepareGitDeployment();
      
      log('\n' + '='.repeat(60), 'bright');
      log('🎉 Deploy Build Process Completed Successfully!', 'green');
      log('='.repeat(60), 'bright');
      
    } catch (error) {
      logError(`Deploy build failed: ${error.message}`);
      process.exit(1);
    }
  }

  async runBuild() {
    logStep('1. Running Build Command');
    
    try {
      logInfo(`Executing: ${CONFIG.build.command}`);
      logInfo(`Timeout: ${CONFIG.build.timeout / 1000} seconds`);
      
      // Change to client directory if it exists
      const clientDir = path.join(process.cwd(), 'client');
      if (await this.directoryExists(clientDir)) {
        process.chdir(clientDir);
        logInfo('Changed to client directory for build');
      }
      
      // Run build command
      execSync(CONFIG.build.command, { 
        stdio: 'inherit',
        timeout: CONFIG.build.timeout
      });
      
      logSuccess('Build completed successfully');
      
      // Change back to original directory
      process.chdir(this.originalDir);
      
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async analyzeBuildSize() {
    logStep('2. Analyzing Build Size');
    
    try {
      // Find build output directory
      this.buildPath = await this.findBuildDirectory();
      
      if (!this.buildPath) {
        throw new Error('Build output directory not found. Check if build completed successfully.');
      }
      
      logInfo(`Found build directory: ${this.buildPath}`);
      
      // Calculate total size
      this.buildSize = await this.calculateDirectorySize(this.buildPath);
      const sizeInMB = this.buildSize / (1024 * 1024);
      const sizeInKB = this.buildSize / 1024;
      
      logInfo(`Build size: ${sizeInMB.toFixed(2)} MB (${sizeInKB.toFixed(0)} KB)`);
      
      // Check against Netlify limit
      if (this.buildSize > CONFIG.build.maxSize) {
        logWarning('⚠️  Build size exceeds 1MB!');
        logWarning('This may cause issues with Netlify deployment.');
        logWarning('Consider optimizing:');
        logWarning('  • Enable gzip compression');
        logWarning('  • Use dynamic imports for code splitting');
        logWarning('  • Optimize images and assets');
        logWarning('  • Remove unused dependencies');
      } else {
        logSuccess('Build size is within acceptable limits for Netlify');
      }
      
    } catch (error) {
      throw new Error(`Build size analysis failed: ${error.message}`);
    }
  }

  async prepareGitDeployment() {
    logStep('3. Preparing Git for Deployment');
    
    try {
      // Check if we're in a Git repository
      await this.checkGitRepository();
      
      // Stage all changes
      await this.stageChanges();
      
      // Commit changes
      await this.commitChanges();
      
      // Push changes (unless dry run)
      if (!CONFIG.git.dryRun) {
        await this.pushChanges();
      } else {
        logInfo('DRY RUN: Skipping git push');
      }
      
    } catch (error) {
      throw new Error(`Git preparation failed: ${error.message}`);
    }
  }

  async checkGitRepository() {
    try {
      execSync('git status', { stdio: 'pipe' });
      logInfo('Git repository found');
    } catch (error) {
      throw new Error('Not a Git repository. Please initialize Git first.');
    }
  }

  async stageChanges() {
    try {
      logInfo('Staging all changes...');
      execSync('git add .', { stdio: 'inherit' });
      logSuccess('All changes staged successfully');
    } catch (error) {
      throw new Error(`Failed to stage changes: ${error.message}`);
    }
  }

  async commitChanges() {
    try {
      logInfo(`Committing with message: "${CONFIG.git.commitMessage}"`);
      execSync(`git commit -m "${CONFIG.git.commitMessage}"`, { stdio: 'inherit' });
      logSuccess('Changes committed successfully');
    } catch (error) {
      if (error.message.includes('nothing to commit')) {
        logInfo('No changes to commit');
      } else {
        throw new Error(`Failed to commit changes: ${error.message}`);
      }
    }
  }

  async pushChanges() {
    try {
      logInfo('Pushing to remote repository...');
      execSync('git push', { stdio: 'inherit' });
      logSuccess('Changes pushed successfully');
    } catch (error) {
      throw new Error(`Failed to push changes: ${error.message}`);
    }
  }

  async findBuildDirectory() {
    // Check common build output directories
    for (const folder of CONFIG.outputFolders) {
      const folderPath = path.join(process.cwd(), folder);
      if (await this.directoryExists(folderPath)) {
        return folderPath;
      }
    }
    
    // Check client directory for build folders
    const clientDir = path.join(process.cwd(), 'client');
    if (await this.directoryExists(clientDir)) {
      for (const folder of CONFIG.outputFolders) {
        const folderPath = path.join(clientDir, folder);
        if (await this.directoryExists(folderPath)) {
          return folderPath;
        }
      }
    }
    
    return null;
  }

  async calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        totalSize += await this.calculateDirectorySize(filePath);
      } else {
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }

  async directoryExists(dirPath) {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }

  generateReport() {
    log('\n📊 Build Summary:', 'bright');
    log('='.repeat(40), 'bright');
    
    if (this.buildPath) {
      const sizeInMB = this.buildSize / (1024 * 1024);
      log(`📁 Build Directory: ${path.relative(process.cwd(), this.buildPath)}`);
      log(`📦 Build Size: ${sizeInMB.toFixed(2)} MB`);
      
      if (this.buildSize > CONFIG.build.maxSize) {
        logWarning('⚠️  Size exceeds Netlify limit (1MB)');
      } else {
        logSuccess('✅ Size within Netlify limits');
      }
    }
    
    if (CONFIG.git.dryRun) {
      logInfo('🔍 DRY RUN MODE: No actual deployment performed');
    } else {
      logSuccess('✅ Git repository prepared for deployment');
    }
  }
}

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 WBCO Deploy Build Script

Usage: node deploy-build.js [options]

Options:
  --dry-run    Log everything but skip git push
  --help, -h   Show this help message

Examples:
  node deploy-build.js              # Full deployment
  node deploy-build.js --dry-run    # Dry run mode
`);
    process.exit(0);
  }
  
  if (args.includes('--dry-run')) {
    logInfo('DRY RUN MODE ENABLED');
    CONFIG.git.dryRun = true;
  }
}

// Validate environment
function validateEnvironment() {
  // Check if npm is available
  try {
    execSync('npm --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('npm is not available. Please install Node.js and npm.');
  }
  
  // Check if git is available
  try {
    execSync('git --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('git is not available. Please install Git.');
  }
}

// Main execution
async function main() {
  try {
    log('='.repeat(60), 'bright');
    log('🚀 WBCO Deploy Build Script', 'bright');
    log('='.repeat(60), 'bright');
    
    parseArguments();
    validateEnvironment();
    
    const runner = new DeployBuildRunner();
    await runner.run();
    
    runner.generateReport();
    
  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { DeployBuildRunner, CONFIG };
