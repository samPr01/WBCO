#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function setupDeployScript() {
  try {
    console.log('🚀 Setting up deploy test script...');
    
    // Path to main package.json
    const mainPackagePath = path.join(process.cwd(), '..', 'package.json');
    const scriptsPackagePath = path.join(process.cwd(), 'package.json');
    
    // Read main package.json
    const mainPackageContent = await fs.readFile(mainPackagePath, 'utf8');
    const mainPackage = JSON.parse(mainPackageContent);
    
    // Read scripts package.json
    const scriptsPackageContent = await fs.readFile(scriptsPackagePath, 'utf8');
    const scriptsPackage = JSON.parse(scriptsPackageContent);
    
    // Add deploy test script to main package.json
    if (!mainPackage.scripts) {
      mainPackage.scripts = {};
    }
    
    mainPackage.scripts['deploy-test'] = 'cd scripts && npm run deploy-test';
    mainPackage.scripts['deploy-test:install'] = 'cd scripts && npm install && npm run deploy-test';
    
    // Add scripts dependencies to main package.json
    if (!mainPackage.devDependencies) {
      mainPackage.devDependencies = {};
    }
    
    // Add required dependencies
    Object.entries(scriptsPackage.dependencies).forEach(([dep, version]) => {
      if (!mainPackage.devDependencies[dep]) {
        mainPackage.devDependencies[dep] = version;
      }
    });
    
    // Write updated package.json
    await fs.writeFile(mainPackagePath, JSON.stringify(mainPackage, null, 2));
    
    console.log('✅ Deploy test script added to main package.json');
    console.log('📝 Available commands:');
    console.log('  npm run deploy-test        - Run deploy tests');
    console.log('  npm run deploy-test:install - Install dependencies and run tests');
    
    // Create config directory if it doesn't exist
    const configDir = path.join(process.cwd(), '..', 'config');
    try {
      await fs.access(configDir);
    } catch {
      await fs.mkdir(configDir, { recursive: true });
      console.log('✅ Created config directory');
    }
    
    console.log('\n🎉 Setup complete! You can now run:');
    console.log('  npm run deploy-test');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDeployScript();
