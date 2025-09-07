# XSM Market - Hostinger Deployment Guide

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)
```bash
# Deploy everything (frontend + backend)
./deploy-to-hostinger.sh

# Deploy frontend only
./deploy-to-hostinger.sh frontend-only

# Deploy backend only
./deploy-to-hostinger.sh backend-only

# Verify deployment
./deploy-to-hostinger.sh verify
```

### Option 2: Manual Deployment
```bash
# 1. Build frontend
npm install
npm run build

# 2. Copy files to deployment folder
cp -r dist/* hostinger-deployment/public_html_6_12/
cp -r php-backend/* hostinger-deployment/public_html_6_12/api/

# 3. Create deployment archive
cd hostinger-deployment/public_html_6_12
zip -r ../xsm-market-deployment.zip .
```

## 📁 Deployment Structure

```
hostinger-deployment/
├── public_html_6_12/           # Main deployment folder
│   ├── index.html             # Built frontend
│   ├── assets/                # Frontend assets
│   ├── api/                   # PHP backend
│   │   ├── index.php         # API entry point
│   │   ├── controllers/      # API controllers
│   │   ├── models/           # Database models
│   │   └── webhooks/         # Payment webhooks
│   ├── .env.production       # Production environment
│   └── .htaccess             # Apache configuration
└── xsm-market-deployment.zip # Deployment archive
```

## 🔧 Environment Configuration

### Frontend Environment (.env.production)
```bash
VITE_API_URL=https://xsmmarket.com/api
VITE_APP_NAME="XSM Market"
VITE_APP_ENV=production
VITE_RECAPTCHA_SITE_KEY=6LfTNporAAAAAFLpNrgqR9pOIBnp5GsVR2w2AJex
```

### Backend Environment (api/.env)
```bash
# Database Configuration
DB_HOST=127.0.0.1
DB_NAME=u718696665_xsm_market_db
DB_USER=u718696665_xsm_user
DB_PASSWORD=HamzaZain123
DB_PORT=3306

# JWT Configuration
JWT_SECRET=xsm-market-secret-key-2025-production
JWT_REFRESH_SECRET=xsm-market-refresh-secret-key-2025-production

# Google OAuth
GOOGLE_CLIENT_ID=706026691678-kbn3pqlj9f5t7o8sri6lf5ucgi03btjb.apps.googleusercontent.com

# Email Configuration
GMAIL_USER=Tiktokwaalii2@gmail.com
GMAIL_APP_PASSWORD=ytaj wcfp kpya ziqj

# NOWPayments
NOW_PAYMENTS_API_KEY_PRODUCTION=1PZWJCA-2D24K0Z-Q8G8BNP-Z4NN5X5
NOW_PAYMENTS_IPN_SECRET_PRODUCTION=ISiEUUwIZVvuFP/EGq7PJO9LRmCgbUjj
```

## 🔐 GitHub Actions Setup

### Required Secrets
Add these secrets to your GitHub repository:

1. **HOSTINGER_FTP_HOST**: Your Hostinger FTP host (e.g., `ftp.xsmmarket.com`)
2. **HOSTINGER_FTP_USERNAME**: Your FTP username
3. **HOSTINGER_FTP_PASSWORD**: Your FTP password

### Setting up Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

### Workflow Triggers
The GitHub Actions workflow will automatically deploy when:
- You push to the `main` branch
- Changes are made to these paths:
  - `src/**` (frontend source)
  - `php-backend/**` (backend source)
  - `public/**` (public assets)
  - `package.json`
  - `vite.config.ts`
  - `.env.production`

## 🧪 Testing Deployment

### Health Checks
- **Frontend**: https://xsmmarket.com
- **API Health**: https://xsmmarket.com/api/health.php
- **Database Test**: https://xsmmarket.com/api/test-db-connection.php

### Manual Testing
```bash
# Test API connectivity
curl https://xsmmarket.com/api/health.php

# Test database connection
curl https://xsmmarket.com/api/test-db-connection.php
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **API Not Working**
   - Check PHP version (should be 8.1+)
   - Verify .env file in api/ folder
   - Check file permissions on server

3. **Database Connection Issues**
   - Verify database credentials in api/.env
   - Check if database exists on Hostinger
   - Run database migration scripts if needed

4. **FTP Upload Fails**
   - Verify FTP credentials
   - Check server disk space
   - Ensure correct FTP server address

### Logs and Debugging
- Check browser console for frontend errors
- Check PHP error logs on Hostinger
- Use the test files in api/test/ for debugging

## 📝 Deployment Checklist

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Environment files are configured
- [ ] Database credentials are correct
- [ ] FTP credentials are set up
- [ ] GitHub Actions secrets are configured
- [ ] Test deployment locally first
- [ ] Verify all URLs work after deployment

## 🔄 Rollback Procedure

If deployment fails:

1. **Quick Rollback**
   ```bash
   # Restore from backup
   cp -r hostinger-deployment/public_html_6_12_backup_TIMESTAMP/* hostinger-deployment/public_html_6_12/
   ```

2. **GitHub Rollback**
   - Go to GitHub Actions
   - Find the failed deployment
   - Click "Re-run jobs" or revert the commit

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Test locally before deploying
4. Contact Hostinger support if needed

---

**Last Updated**: September 7, 2025
**Version**: 1.0.0
