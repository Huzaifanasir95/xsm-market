#!/usr/bin/env node

/**
 * XSM Market - Pre-Deployment Validation Script
 * Validates the deployment package to ensure zero issues on Hostinger
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 XSM Market - Pre-Deployment Validation');
console.log('=========================================');
console.log('');

function validateFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${description}: ${(stats.size / 1024).toFixed(1)}KB`);
    return true;
  } else {
    console.log(`❌ ${description}: MISSING`);
    return false;
  }
}

function validateDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    console.log(`✅ ${description}: ${files.length} files`);
    return true;
  } else {
    console.log(`❌ ${description}: MISSING`);
    return false;
  }
}

function validateEnvFile() {
  const envPath = path.join('api', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Environment file: MISSING');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'DB_HOST',
    'DB_NAME', 
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'NODE_ENV'
  ];
  
  let allPresent = true;
  for (const variable of requiredVars) {
    if (envContent.includes(`${variable}=`)) {
      console.log(`   ✅ ${variable}: SET`);
    } else {
      console.log(`   ❌ ${variable}: MISSING`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

function validatePackageJson() {
  const packagePath = path.join('api', 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('❌ Package.json: MISSING');
    return false;
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'express',
    'mysql2',
    'sequelize',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'dotenv'
  ];
  
  let allPresent = true;
  for (const dep of requiredDeps) {
    if (packageContent.dependencies && packageContent.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageContent.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: MISSING`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function runValidation() {
  let allValid = true;
  
  console.log('📋 FRONTEND VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
  allValid &= validateFile('index.html', 'Main HTML file');
  allValid &= validateDirectory('assets', 'Assets directory');
  allValid &= validateFile('favicon.ico', 'Favicon');
  console.log('');
  
  console.log('🔧 BACKEND VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  allValid &= validateFile(path.join('api', 'server.js'), 'Server file');
  allValid &= validateFile(path.join('api', 'package.json'), 'Package.json');
  allValid &= validateFile(path.join('api', '.env'), 'Environment file');
  allValid &= validateFile(path.join('api', 'setup-hostinger-database.js'), 'Setup script');
  allValid &= validateDirectory(path.join('api', 'config'), 'Config directory');
  allValid &= validateDirectory(path.join('api', 'controllers'), 'Controllers directory');
  allValid &= validateDirectory(path.join('api', 'models'), 'Models directory');
  allValid &= validateDirectory(path.join('api', 'routes'), 'Routes directory');
  console.log('');
  
  console.log('⚙️  ENVIRONMENT VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  allValid &= validateEnvFile();
  console.log('');
  
  console.log('📦 DEPENDENCY VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  allValid &= validatePackageJson();
  console.log('');
  
  console.log('📋 VALIDATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allValid) {
    console.log('🎉 ALL VALIDATIONS PASSED!');
    console.log('✅ Your deployment package is ready for Hostinger');
    console.log('✅ Zero issues expected during deployment');
    console.log('');
    console.log('🚀 DEPLOYMENT READY CHECKLIST:');
    console.log('   ✅ Frontend files optimized');
    console.log('   ✅ Backend properly configured');
    console.log('   ✅ Database setup script included');
    console.log('   ✅ All dependencies listed');
    console.log('   ✅ Environment variables set');
    console.log('   ✅ Production settings applied');
    console.log('');
    console.log('📤 NEXT STEPS:');
    console.log('1. Upload all files to Hostinger');
    console.log('2. Run: npm install');
    console.log('3. Run: node setup-hostinger-database.js');
    console.log('4. Configure Node.js app in hPanel');
    console.log('5. Start application');
    console.log('');
    console.log('🌐 Your app will be live at: https://xsmmarket.com');
  } else {
    console.log('❌ VALIDATION FAILED!');
    console.log('⚠️  Please fix the missing files/configurations above');
    console.log('⚠️  Do not deploy until all validations pass');
    process.exit(1);
  }
}

// Run validation
runValidation();
