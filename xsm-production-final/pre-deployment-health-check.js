#!/usr/bin/env node

/**
 * XSM Market - Pre-Deployment Health Check
 * Comprehensive validation before uploading to Hostinger
 * 
 * This script validates EVERYTHING to ensure 100% successful deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 XSM Market - Pre-Deployment Health Check');
console.log('===========================================');
console.log('');

let allChecksPass = true;
const issues = [];
const warnings = [];

// Helper function to log results
function logCheck(description, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${description}`);
  if (details) console.log(`   ${details}`);
  if (!passed) {
    allChecksPass = false;
    issues.push(description);
  }
}

function logWarning(description, details = '') {
  console.log(`⚠️  ${description}`);
  if (details) console.log(`   ${details}`);
  warnings.push(description);
}

// Check 1: Essential Files
console.log('📁 CHECKING ESSENTIAL FILES');
console.log('───────────────────────────');

const essentialFiles = [
  'index.html',
  'favicon.ico',
  'robots.txt',
  'api/server.js',
  'api/.env',
  'api/package.json',
  'api/setup-hostinger-database.js',
  'DEPLOYMENT_GUIDE.md'
];

essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  logCheck(`Essential file: ${file}`, exists);
});

// Check 2: Asset Directory
const assetsExists = fs.existsSync('assets') && fs.statSync('assets').isDirectory();
logCheck('Assets directory exists', assetsExists);

if (assetsExists) {
  const jsFiles = fs.readdirSync('assets').filter(f => f.endsWith('.js'));
  const cssFiles = fs.readdirSync('assets').filter(f => f.endsWith('.css'));
  logCheck('JavaScript assets present', jsFiles.length > 0, `Found ${jsFiles.length} JS files`);
  logCheck('CSS assets present', cssFiles.length > 0, `Found ${cssFiles.length} CSS files`);
}

console.log('');

// Check 3: Environment Configuration
console.log('🔧 CHECKING ENVIRONMENT CONFIGURATION');
console.log('─────────────────────────────────────');

if (fs.existsSync('api/.env')) {
  const envContent = fs.readFileSync('api/.env', 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME', 
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'VITE_API_URL',
    'NODE_ENV'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const hasVar = envLines.some(line => line.startsWith(`${envVar}=`));
    logCheck(`Environment variable: ${envVar}`, hasVar);
  });
  
  // Check production URLs
  const hasCorrectApiUrl = envContent.includes('VITE_API_URL=https://xsmmarket.com/api');
  logCheck('Production API URL configured', hasCorrectApiUrl);
  
  const hasProductionEnv = envContent.includes('NODE_ENV=production');
  logCheck('Production environment set', hasProductionEnv);
  
  // Check database credentials format
  const hasHostingerDbFormat = envContent.includes('u718696665_');
  logCheck('Hostinger database format detected', hasHostingerDbFormat);
  
} else {
  logCheck('Environment file exists', false);
}

console.log('');

// Check 4: Package Dependencies
console.log('📦 CHECKING PACKAGE DEPENDENCIES');
console.log('─────────────────────────────────');

if (fs.existsSync('api/package.json')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('api/package.json', 'utf8'));
    
    const requiredDeps = [
      'express',
      'mysql2',
      'cors',
      'dotenv',
      'bcryptjs',
      'jsonwebtoken',
      'nodemailer',
      'express-rate-limit',
      'helmet'
    ];
    
    requiredDeps.forEach(dep => {
      const hasDepInDeps = packageJson.dependencies && packageJson.dependencies[dep];
      const hasDepInDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
      const hasDep = hasDepInDeps || hasDepInDevDeps;
      logCheck(`Dependency: ${dep}`, hasDep);
    });
    
    // Check scripts
    const hasStartScript = packageJson.scripts && packageJson.scripts.start;
    logCheck('Start script configured', hasStartScript);
    
    // Check Node.js version compatibility
    const engines = packageJson.engines;
    if (engines && engines.node) {
      logCheck('Node.js version specified', true, `Requires: ${engines.node}`);
    } else {
      logWarning('Node.js version not specified', 'Consider adding engines.node to package.json');
    }
    
  } catch (error) {
    logCheck('Package.json is valid JSON', false, error.message);
  }
} else {
  logCheck('Package.json exists', false);
}

console.log('');

// Check 5: Database Setup Script
console.log('🗄️  CHECKING DATABASE SETUP');
console.log('───────────────────────────');

if (fs.existsSync('api/setup-hostinger-database.js')) {
  const setupScript = fs.readFileSync('api/setup-hostinger-database.js', 'utf8');
  
  logCheck('Database setup script exists', true);
  logCheck('Contains MySQL connection logic', setupScript.includes('mysql.createConnection'));
  logCheck('Contains table creation', setupScript.includes('CREATE TABLE'));
  logCheck('Contains sample data insertion', setupScript.includes('INSERT INTO'));
  logCheck('Has error handling', setupScript.includes('catch'));
  logCheck('Has retry logic', setupScript.includes('retries'));
  
} else {
  logCheck('Database setup script exists', false);
}

console.log('');

// Check 6: API Structure
console.log('🔌 CHECKING API STRUCTURE');
console.log('─────────────────────────');

const apiDirs = ['controllers', 'models', 'routes', 'middleware', 'config'];
apiDirs.forEach(dir => {
  const dirPath = `api/${dir}`;
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  logCheck(`API directory: ${dir}`, exists);
  
  if (exists) {
    const files = fs.readdirSync(dirPath);
    logCheck(`${dir} has files`, files.length > 0, `${files.length} files found`);
  }
});

// Check specific important files
const importantApiFiles = [
  'api/controllers/authController.js',
  'api/controllers/adController.js', 
  'api/models/User.js',
  'api/models/Ad.js',
  'api/routes/auth.js',
  'api/routes/ads.js'
];

importantApiFiles.forEach(file => {
  const exists = fs.existsSync(file);
  logCheck(`API file: ${path.basename(file)}`, exists);
});

console.log('');

// Check 7: Frontend Build Validation
console.log('🌐 CHECKING FRONTEND BUILD');
console.log('─────────────────────────');

if (fs.existsSync('index.html')) {
  const indexContent = fs.readFileSync('index.html', 'utf8');
  
  logCheck('index.html is not empty', indexContent.trim().length > 0);
  logCheck('Contains proper HTML structure', indexContent.includes('<html') && indexContent.includes('</html>'));
  logCheck('Has viewport meta tag', indexContent.includes('viewport'));
  logCheck('References assets correctly', indexContent.includes('./assets/') || indexContent.includes('/assets/'));
  
  // Check for production URLs
  const hasLocalUrls = indexContent.includes('localhost') || indexContent.includes('127.0.0.1');
  if (hasLocalUrls) {
    logWarning('Frontend contains localhost URLs', 'May cause issues in production');
  }
  
} else {
  logCheck('index.html exists', false);
}

console.log('');

// Check 8: Security Configuration
console.log('🔒 CHECKING SECURITY CONFIGURATION');
console.log('─────────────────────────────────');

if (fs.existsSync('api/server.js')) {
  const serverContent = fs.readFileSync('api/server.js', 'utf8');
  
  logCheck('CORS configured', serverContent.includes('cors'));
  logCheck('Helmet security middleware', serverContent.includes('helmet'));
  logCheck('Rate limiting', serverContent.includes('rate-limit') || serverContent.includes('rateLimit'));
  logCheck('Production environment checks', serverContent.includes('NODE_ENV'));
  
  // Check for development-only code
  const hasConsoleLog = serverContent.includes('console.log');
  if (hasConsoleLog) {
    logWarning('Server contains console.log statements', 'Consider removing for production');
  }
}

console.log('');

// Check 9: File Permissions and Size
console.log('📏 CHECKING FILE SPECIFICATIONS');
console.log('───────────────────────────────');

// Check total package size
const getDirectorySize = (dirPath) => {
  let totalSize = 0;
  
  const traverse = (currentPath) => {
    const stats = fs.statSync(currentPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        traverse(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  };
  
  traverse(dirPath);
  return totalSize;
};

const totalSize = getDirectorySize('.');
const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
logCheck('Package size reasonable', totalSize < 100 * 1024 * 1024, `${totalSizeMB} MB`);

// Check for large files that might cause upload issues
const findLargeFiles = (dirPath, maxSize = 10 * 1024 * 1024) => {
  const largeFiles = [];
  
  const traverse = (currentPath) => {
    const stats = fs.statSync(currentPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        traverse(path.join(currentPath, file));
      });
    } else if (stats.size > maxSize) {
      largeFiles.push({ path: currentPath, size: (stats.size / (1024 * 1024)).toFixed(2) });
    }
  };
  
  traverse(dirPath);
  return largeFiles;
};

const largeFiles = findLargeFiles('.');
if (largeFiles.length > 0) {
  logWarning('Large files detected', `${largeFiles.length} files > 10MB`);
  largeFiles.forEach(file => {
    console.log(`   📁 ${file.path} (${file.size} MB)`);
  });
}

console.log('');

// Check 10: Deployment Readiness
console.log('🚀 CHECKING DEPLOYMENT READINESS');
console.log('─────────────────────────────────');

// Check for development artifacts
const devArtifacts = [
  'node_modules',
  '.git',
  '.DS_Store',
  'npm-debug.log',
  '.env.local',
  '.env.development'
];

devArtifacts.forEach(artifact => {
  const exists = fs.existsSync(artifact);
  if (exists) {
    logWarning(`Development artifact present: ${artifact}`, 'Should be removed before deployment');
  } else {
    logCheck(`No ${artifact} present`, true);
  }
});

console.log('');

// Final Report
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 HEALTH CHECK SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (allChecksPass && issues.length === 0) {
  console.log('🎉 ALL CHECKS PASSED! ');
  console.log('✅ Your deployment package is ready for Hostinger!');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Upload files to Hostinger File Manager');
  console.log('2. Create MySQL database in hPanel');
  console.log('3. Run: node setup-hostinger-database.js');
  console.log('4. Configure Node.js app in Hostinger');
  console.log('5. Visit your domain to verify deployment');
} else {
  console.log('❌ DEPLOYMENT NOT READY!');
  console.log(`   ${issues.length} critical issues found`);
  console.log('');
  console.log('🔧 CRITICAL ISSUES TO FIX:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

if (warnings.length > 0) {
  console.log('');
  console.log('⚠️  WARNINGS (non-critical):');
  warnings.forEach((warning, index) => {
    console.log(`${index + 1}. ${warning}`);
  });
}

console.log('');
console.log('💡 For deployment help, see DEPLOYMENT_GUIDE.md');
console.log('');

// Exit with appropriate code
process.exit(allChecksPass && issues.length === 0 ? 0 : 1);
