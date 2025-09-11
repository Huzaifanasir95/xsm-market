# GitHub Actions Deployment Setup for Hostinger

This document explains how to set up automated deployment to Hostinger using GitHub Actions and SSH.

## Prerequisites

1. SSH access to your Hostinger hosting account
2. GitHub repository with your code
3. Hostinger cPanel or SSH credentials

## Step 1: Get SSH Access Details from Hostinger

### Option A: Through cPanel
1. Log into your Hostinger cPanel
2. Go to "Advanced" → "SSH Access"
3. Enable SSH access if not already enabled
4. Note down:
   - SSH Host (usually your domain or an IP like `154.56.xx.xx`)
   - SSH Port (usually 22)
   - SSH Username (usually your cPanel username)

### Option B: Through Hostinger Panel
1. Go to Hosting → Manage → SSH Access
2. Create/download SSH keys or use password authentication
3. Note the connection details

## Step 2: Generate SSH Key Pair (if needed)

If you don't have SSH keys, generate them:

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
# Save as ~/.ssh/hostinger_deploy_key (without passphrase for automation)

# Get the public key content
cat ~/.ssh/hostinger_deploy_key.pub
```

Add the public key to your Hostinger SSH authorized keys:
```bash
# SSH into your Hostinger account
ssh your-username@your-host

# Add the public key to authorized keys
mkdir -p ~/.ssh
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## Step 3: Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

### SSH Configuration
```
SSH_PRIVATE_KEY = [Content of your private key file]
SSH_HOST = your-domain.com (or IP address)
SSH_USER = your-hostinger-username
REMOTE_PATH = /home/your-username/domains/your-domain.com (or your hosting path)
```

### Database Configuration (from Hostinger cPanel → MySQL Databases)
```
DB_HOST = localhost (or 127.0.0.1)
DB_NAME = your-database-name (e.g., u123456_xsm_market)
DB_USER = your-database-user (e.g., u123456_xsm_user)
DB_PASSWORD = your-database-password
```

### Application URLs
```
FRONTEND_URL = https://your-domain.com
VITE_API_URL = https://your-domain.com/api
```

### JWT Secrets (generate strong random strings)
```
JWT_SECRET = your-jwt-secret-key-production
JWT_REFRESH_SECRET = your-jwt-refresh-secret-key-production
```

### Google OAuth (from Google Cloud Console)
```
VITE_GOOGLE_CLIENT_ID = your-google-client-id
```

### Email Configuration (Gmail App Password)
```
GMAIL_USER = your-email@gmail.com
GMAIL_APP_PASSWORD = your-16-character-app-password
ADMIN_EMAIL = admin@your-domain.com
```

### reCAPTCHA (from Google reCAPTCHA Console)
```
VITE_RECAPTCHA_SITE_KEY = your-recaptcha-site-key
RECAPTCHA_SECRET_KEY = your-recaptcha-secret-key
```

### Social Blade API (if using)
```
SOCIALBLADE_CLIENT_ID = your-socialblade-client-id
SOCIALBLADE_TOKEN = your-socialblade-token
```

### NOWPayments (if using crypto payments)
```
NOW_PAYMENTS_API_KEY_PRODUCTION = your-production-api-key
NOW_PAYMENTS_IPN_SECRET_PRODUCTION = your-production-ipn-secret
NOW_PAYMENTS_API_KEY_SANDBOX = your-sandbox-api-key
NOW_PAYMENTS_IPN_SECRET_SANDBOX = your-sandbox-ipn-secret
NOW_PAYMENTS_ENVIRONMENT = production (or sandbox)
NOW_PAYMENTS_WEBHOOK_URL = https://your-domain.com/api/webhooks/nowpayments
```

## Step 4: Hostinger Directory Structure

Your Hostinger hosting should have this structure:
```
/home/your-username/
  domains/
    your-domain.com/
      public_html/          ← This is where files will be deployed
        index.html          ← Frontend files
        assets/
        api/                ← PHP backend
          server.php
          controllers/
          ...
        .htaccess          ← URL rewriting rules
```

## Step 5: Test the SSH Connection

Test your SSH connection locally:
```bash
# Test SSH connection
ssh your-username@your-host

# Test file upload
echo "test" > test.txt
scp test.txt your-username@your-host:/home/your-username/domains/your-domain.com/public_html/
rm test.txt
```

## Step 6: Trigger Deployment

### Automatic Deployment
- Push to `main` branch
- Merge a pull request to `main`

### Manual Deployment
1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy to Hostinger"
4. Click "Run workflow"

## Troubleshooting

### Common Issues:

1. **SSH Permission Denied**
   - Check if SSH is enabled in Hostinger
   - Verify SSH key is properly added to authorized_keys
   - Check username and host are correct

2. **File Permission Errors**
   - The workflow sets proper permissions automatically
   - PHP files: 644, Directories: 755

3. **Database Connection Errors**
   - Verify database credentials in Hostinger cPanel
   - Check if database user has proper permissions
   - Ensure database host is correct (usually localhost)

4. **reCAPTCHA Issues**
   - Add your domain to reCAPTCHA site settings
   - Use the correct site key for your domain

5. **Email Not Working**
   - Use Gmail App Password, not regular password
   - Enable 2FA on Gmail first, then generate app password

## Security Best Practices

1. **Never commit secrets to code**
2. **Use environment-specific configurations**
3. **Regularly rotate SSH keys and passwords**
4. **Monitor deployment logs for security issues**
5. **Keep dependencies updated**

## Example SSH Key Setup

1. **Generate key pair:**
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/hostinger_deploy
```

2. **Copy public key to Hostinger:**
```bash
ssh-copy-id -i ~/.ssh/hostinger_deploy.pub username@your-host
```

3. **Test connection:**
```bash
ssh -i ~/.ssh/hostinger_deploy username@your-host
```

4. **Add private key to GitHub Secrets:**
   - Copy content of `~/.ssh/hostinger_deploy` (private key)
   - Add as `SSH_PRIVATE_KEY` secret in GitHub

## Monitoring Deployment

After deployment, monitor:
- GitHub Actions logs
- Your website functionality
- API endpoints
- Database connections
- Email sending functionality

The workflow includes automatic health checks for both frontend and API endpoints.
