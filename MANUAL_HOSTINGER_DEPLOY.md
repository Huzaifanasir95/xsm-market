# XSM Market - Manual Hostinger Deployment Guide

## 🚀 Direct SSH Deployment to Hostinger

### Step 1: Build Your Application
```bash
# Build frontend
npm install
npm run build
```

### Step 2: Connect to Hostinger via SSH
```bash
ssh -p 65002 u718696665@46.202.186.89
# Password: Hello12@69
```

### Step 3: Navigate to Domain Directory
```bash
cd /domains/xsmmarket.com
ls -la
# You should see: public_html/
```

### Step 4: Backup Current Files (Run on Server)
```bash
# Navigate to domain directory
cd /domains/xsmmarket.com

# Create backup
cp -r public_html public_html_backup_$(date +%Y%m%d_%H%M%S)

# Navigate to public_html
cd public_html
```

### Step 4: Clear Old Files (Run on Server)
```bash
# Remove old frontend files (keep .htaccess)
rm -rf assets/ *.html *.js *.css *.json *.png *.ico *.svg *.webmanifest

# Remove old API files
rm -rf api/
```

### Step 5: Upload Files from Local Machine
Open a new terminal window and run:
```bash
# Upload frontend files
scp -P 65002 -r dist/* u718696665@46.202.186.89:/domains/xsmmarket.com/public_html/

# Upload backend files
scp -P 65002 -r php-backend/* u718696665@46.202.186.89:/domains/xsmmarket.com/public_html/

# Upload environment file
scp -P 65002 .env.production u718696665@46.202.186.89:/domains/xsmmarket.com/public_html/
```

### Step 6: Set Proper Permissions (Run on Server)
```bash
cd /domains/xsmmarket.com/public_html

# Set proper permissions for files
find . -type f -exec chmod 644 {} \;

# Set proper permissions for directories
find . -type d -exec chmod 755 {} \;

# Make sure API files are executable
chmod +x api/*.php
chmod +x api/**/*.php

# Set permissions for uploads directory
chmod 755 api/uploads/
chmod 755 api/uploads/* 2>/dev/null || true
```

### Step 7: Verify Deployment (Run on Server)
```bash
# Navigate to the correct directory
cd /domains/xsmmarket.com/public_html

# Check if files exist
ls -la index.html
ls -la api/index.php
ls -la .env.production

# Test PHP
php -v
php api/health.php
```

### Step 8: Test Your Application
- **Frontend**: https://xsmmarket.com
- **API**: https://xsmmarket.com/api
- **Health Check**: https://xsmmarket.com/api/health.php

## 🔧 Troubleshooting

### If Frontend Doesn't Load
```bash
# Check if index.html exists
ls -la public_html/index.html

# Check file permissions
ls -la public_html/index.html
```

### If API Doesn't Work
```bash
# Check PHP version
php -v

# Test API file
php public_html/api/health.php

# Check error logs
tail -f /var/log/apache2/error.log
```

### If Database Connection Fails
```bash
# Check database credentials in .env
cat public_html/api/.env | grep -E "DB_"

# Test database connection
php public_html/api/test-db-connection.php
```

## 🔄 Quick Deploy Script

Create this script locally and run it:

```bash
#!/bin/bash
echo "🚀 Quick Deploy to Hostinger"

# Build
npm run build

# Upload
echo "📤 Uploading files..."
scp -P 65002 -r dist/* u718696665@46.202.186.89:~/public_html/
scp -P 65002 -r php-backend/* u718696665@46.202.186.89:~/public_html/

echo "✅ Upload complete!"
echo "🌐 Test at: https://xsmmarket.com"
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your SSH connection works
3. Make sure all files uploaded correctly
4. Test the URLs provided above

---

**Hostinger SSH Details:**
- **Host**: 46.202.186.89
- **Port**: 65002
- **Username**: u718696665
- **Password**: Hello12@69
- **Web URL**: https://xsmmarket.com
