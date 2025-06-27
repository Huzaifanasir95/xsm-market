#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning XSM Market project...\n');

const filesToClean = [
  'node_modules',
  'backend/node_modules', 
  'dist',
  'backend/dist',
  '.vite',
  'backend/.vite'
];

const deployFilesToClean = [
  'xsm-market-full-deploy-*',
  'deploy-temp',
  '*.zip'
];

console.log('🗂️ Cleaning build files and dependencies...');
filesToClean.forEach(file => {
  const fullPath = path.join(__dirname, '../', file);
  if (fs.existsSync(fullPath)) {
    console.log(`   Removing: ${file}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('\n📦 Cleaning deployment files...');
const rootDir = path.join(__dirname, '../');
const files = fs.readdirSync(rootDir);

files.forEach(file => {
  if (file.startsWith('xsm-market-full-deploy-') || 
      file === 'deploy-temp' || 
      file.endsWith('.zip')) {
    const fullPath = path.join(rootDir, file);
    console.log(`   Removing: ${file}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('\n✅ Project cleaned successfully!');
console.log('\n📋 What was cleaned:');
console.log('   ✓ Node modules (frontend & backend)');
console.log('   ✓ Build artifacts');
console.log('   ✓ Deployment packages');
console.log('   ✓ Temporary files');
console.log('\n🚀 Ready for fresh install: npm run setup-local');
