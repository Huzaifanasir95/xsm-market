#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up XSM Market for local development...\n');

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  console.log('Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing backend dependencies...');
  execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create local environment file for backend
console.log('\n⚙️ Setting up environment files...');
const backendEnvContent = `# Local Development Environment
DB_HOST=localhost
DB_NAME=xsm_market_local
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=local-dev-secret-change-in-production
JWT_REFRESH_SECRET=local-dev-refresh-secret-change-in-production
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
`;

const backendEnvPath = path.join(__dirname, '../backend/.env');
if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env for local development');
} else {
  console.log('ℹ️ backend/.env already exists');
}

// Create frontend environment file
const frontendEnvContent = `VITE_API_URL=http://localhost:5000/api
`;

const frontendEnvPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created .env.local for frontend');
} else {
  console.log('ℹ️ .env.local already exists');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MariaDB/MySQL is running');
console.log('2. Update database password in backend/.env if needed');
console.log('3. Run: npm run db:setup (to create database and tables)');
console.log('4. Run: npm run dev (to start development servers)');
console.log('\n🌐 Your app will be available at:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend:  http://localhost:5000');
console.log('   API:      http://localhost:5000/api');
