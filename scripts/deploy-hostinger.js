#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
const deployDir = `xsm-market-full-deploy-${timestamp}`;
const deployPath = path.join(projectRoot, deployDir);

console.log('🚀 Starting Hostinger deployment package creation...\n');

async function main() {
  try {
    // Clean previous builds and deployment packages
    console.log('🧹 Cleaning previous builds...');
    await fs.remove(path.join(projectRoot, 'dist'));
    await fs.remove(path.join(projectRoot, 'backend/dist'));
    
    // Remove old deployment packages
    const files = await fs.readdir(projectRoot);
    for (const file of files) {
      if (file.startsWith('xsm-market-full-deploy-') || file.endsWith('.zip')) {
        await fs.remove(path.join(projectRoot, file));
      }
    }

    // Build frontend
    console.log('🏗️  Building frontend...');
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });

    // Create deployment directory
    console.log('📦 Creating deployment package...');
    await fs.ensureDir(deployPath);

    // Copy built frontend to deployment directory
    console.log('📋 Copying frontend build...');
    await fs.copy(path.join(projectRoot, 'dist'), deployPath);

    // Copy backend files to deployment directory
    console.log('📋 Copying backend files...');
    const backendPath = path.join(deployPath, 'backend');
    await fs.ensureDir(backendPath);
    
    // Copy backend source files
    await fs.copy(path.join(projectRoot, 'backend/controllers'), path.join(backendPath, 'controllers'));
    await fs.copy(path.join(projectRoot, 'backend/middleware'), path.join(backendPath, 'middleware'));
    await fs.copy(path.join(projectRoot, 'backend/models'), path.join(backendPath, 'models'));
    await fs.copy(path.join(projectRoot, 'backend/routes'), path.join(backendPath, 'routes'));
    await fs.copy(path.join(projectRoot, 'backend/utils'), path.join(backendPath, 'utils'));
    
    // Copy backend package.json and server.js
    await fs.copy(path.join(projectRoot, 'backend/package.json'), path.join(backendPath, 'package.json'));
    await fs.copy(path.join(projectRoot, 'backend/server.js'), path.join(backendPath, 'server.js'));

    // Create production .env for backend
    console.log('🔧 Creating production environment file...');
    const prodEnv = `# Production Environment Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com

# Database Configuration (Update with your Hostinger MariaDB details)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=xsm_market

# JWT Configuration (Update with secure secrets)
JWT_SECRET=your_super_secure_jwt_secret_here_at_least_32_characters
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here_at_least_32_characters

# Email Configuration (Update with your email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Google OAuth (Update with your Google credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
`;
    await fs.writeFile(path.join(backendPath, '.env'), prodEnv);

    // Create .htaccess for Apache (Hostinger uses Apache)
    console.log('🔧 Creating .htaccess file...');
    const htaccess = `# Enable rewrite engine
RewriteEngine On

# Handle Angular/React routing - redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend/
RewriteRule . /index.html [L]

# Proxy API requests to backend
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ /backend/server.js/$1 [P,L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
`;
    await fs.writeFile(path.join(deployPath, '.htaccess'), htaccess);

    // Create deployment instructions
    console.log('📋 Creating deployment instructions...');
    const instructions = `# XSM Market - Hostinger Deployment Instructions

## 🚀 Quick Deployment Steps

1. **Upload Files**
   - Upload ALL contents of this folder to your Hostinger public_html directory
   - This includes: HTML files, CSS, JS, backend folder, .htaccess file

2. **Database Setup**
   - Go to Hostinger Control Panel → Databases → MySQL Databases
   - Create a new database named: xsm_market
   - Note your database credentials (host, username, password)

3. **Configure Environment**
   - Edit backend/.env with your actual database credentials
   - Update CORS_ORIGIN with your domain name
   - Generate secure JWT secrets (at least 32 characters each)
   - Configure email service (Gmail App Password recommended)

4. **Install Backend Dependencies**
   - SSH into your Hostinger server (if available) or use File Manager
   - Navigate to public_html/backend/
   - Run: npm install --production

5. **Database Migration**
   - The app will auto-create tables on first run
   - Or manually run: node server.js (will create tables and exit)

6. **Test Your Deployment**
   - Visit: https://yourdomain.com
   - Test registration/login functionality
   - Check API endpoints: https://yourdomain.com/api/health

## 🔧 Important Configuration Updates

### backend/.env (MUST UPDATE THESE):
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (your Hostinger database)
- JWT_SECRET and JWT_REFRESH_SECRET (generate secure 32+ char strings)
- CORS_ORIGIN=https://yourdomain.com (your actual domain)
- EMAIL_* settings (your email service for OTP)

### If you have issues:
1. Check Hostinger error logs
2. Ensure Node.js is enabled in Hostinger control panel
3. Verify .htaccess is uploaded correctly
4. Test backend directly: yourdomain.com/backend/server.js

## 📁 File Structure on Server:
public_html/
├── index.html (your React app)
├── assets/ (CSS, JS, images)
├── .htaccess (Apache configuration)
└── backend/ (Node.js API server)
    ├── server.js
    ├── package.json
    ├── .env (update this!)
    └── controllers/, models/, routes/, etc.

Generated: ${new Date().toISOString()}
Package: ${deployDir}
`;
    await fs.writeFile(path.join(deployPath, 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);

    // Create deployment package info
    const packageInfo = {
      name: 'XSM Market - Complete Deployment Package',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      contents: [
        'Frontend build (React app)',
        'Backend API server (Node.js)',
        'Production .env template',
        '.htaccess for Apache',
        'Deployment instructions'
      ],
      deployment_target: 'Hostinger Shared Hosting',
      next_steps: [
        '1. Upload all files to public_html/',
        '2. Update backend/.env with your database credentials',
        '3. Install backend dependencies: npm install --production',
        '4. Test your deployment'
      ]
    };
    await fs.writeFile(path.join(deployPath, 'package-info.json'), JSON.stringify(packageInfo, null, 2));

    // Create ZIP file
    console.log('🗜️  Creating ZIP package...');
    const zipName = `${deployDir}.zip`;
    execSync(`zip -r "${zipName}" "${deployDir}"`, { cwd: projectRoot, stdio: 'inherit' });

    // Clean up temporary directory
    await fs.remove(deployPath);

    console.log('\n✅ Deployment package created successfully!');
    console.log(`📦 Package: ${zipName}`);
    console.log(`📏 Size: ${(await fs.stat(path.join(projectRoot, zipName))).size / 1024 / 1024} MB`);
    console.log('\n🚀 Next Steps:');
    console.log('1. Upload the ZIP file to your Hostinger File Manager');
    console.log('2. Extract it in your public_html directory');
    console.log('3. Follow the DEPLOYMENT_INSTRUCTIONS.md inside the package');
    console.log('4. Update backend/.env with your database credentials');
    console.log('\n🎉 Your XSM Market is ready for production!');

  } catch (error) {
    console.error('❌ Deployment package creation failed:', error);
    process.exit(1);
  }
}

main();
