# XSM Market - Production Deployment Guide

## 🚨 Current Issue: Email OTP Not Working in Production

The issue occurs because in production mode (`PHP_ENV=production`), the system tries to send real emails, but the email service might fail due to server configuration issues.

## 🔧 Solution Applied

### 1. Enhanced Email Service
- Added better error logging and debugging
- Added native PHP `mail()` as fallback
- Enhanced production error handling
- Added detailed logging for troubleshooting

### 2. Environment Configuration
- Created `.env.production.template` for proper production setup
- Added debug settings for email troubleshooting

## 📋 Deployment Steps

### Step 1: Upload Files
1. Copy all files from `hostinger-deployment/public_html_6_12/` to your Hostinger public_html directory
2. Ensure proper file permissions (644 for files, 755 for directories)

### Step 2: Configure Environment
1. Rename `.env.production.template` to `.env`
2. Update the following values in `.env`:
   ```
   DB_HOST=localhost
   DB_NAME=your_hostinger_database_name  
   DB_USER=your_hostinger_database_user
   DB_PASSWORD=your_hostinger_database_password
   FRONTEND_URL=https://yourdomain.com
   ```

### Step 3: Email Configuration
1. Verify Gmail credentials are correct:
   ```
   GMAIL_USER=Tiktokwaalii2@gmail.com
   GMAIL_APP_PASSWORD=ytaj wcfp kpya ziqj
   ```
2. Make sure the Gmail account has "2-Step Verification" enabled
3. Generate an "App Password" specifically for this application

### Step 4: Test Email Functionality
1. Visit: `https://yourdomain.com/test-email.php`
2. Test the email sending functionality
3. Check server error logs for detailed debugging info

### Step 5: Debug Registration (If Still Issues)
1. Visit: `https://yourdomain.com/debug-register.php`
2. Try a test registration to see detailed debugging info
3. Check the response for specific error details

## 🐛 Troubleshooting Common Issues

### Issue 1: PHPMailer Not Available
**Solution:** The system will automatically fallback to direct SMTP or native PHP `mail()`

### Issue 2: SMTP Connection Fails
**Solution:** The system tries multiple methods:
1. PHPMailer with SMTP
2. Direct SMTP connection
3. Native PHP `mail()` function

### Issue 3: Gmail App Password Issues
**Symptoms:** Email sending fails with authentication error
**Solution:**
1. Enable 2-Step Verification on Gmail account
2. Generate a new App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `GMAIL_APP_PASSWORD`

### Issue 4: Server mail() Function Disabled
**Symptoms:** All email methods fail
**Solution:** Contact Hostinger support to enable PHP `mail()` function

## 📧 Email Debugging

### Check Email Logs
- Server error logs: Check cPanel > Error Logs
- Mock email log: `/logs/mock-emails.log` (if fallback is used)

### Test Email Configuration
```bash
# Check if Gmail credentials are loaded
echo "Gmail User: " . getenv('GMAIL_USER');
echo "Has Password: " . (getenv('GMAIL_APP_PASSWORD') ? 'YES' : 'NO');
```

### Manual OTP for Testing
If emails fail in production, the OTP is logged in server error logs for manual verification:
```
🚨 PRODUCTION EMAIL FAILED - Manual OTP for user@email.com: 123456
```

## 🔍 Debug Tools Included

1. **test-email.php** - Test email functionality
2. **debug-register.php** - Debug registration process with detailed logging
3. **Enhanced error logging** - All email attempts are logged

## ⚡ Quick Fix for Immediate Use

If emails are still not working:

1. **Temporary Solution:** Set `PHP_ENV=development` in `.env`
   - This will skip real email sending
   - Check `/logs/mock-emails.log` for OTP codes
   
2. **Long-term Solution:** Fix email configuration
   - Use debug tools to identify the exact issue
   - Contact Hostinger support if server-level mail restrictions exist

## 📝 Server Requirements

- PHP 7.4 or higher
- MySQL/MariaDB
- PHP extensions: PDO, curl, json
- PHP `mail()` function enabled (for fallback)

## 🔄 Environment Variables Summary

```env
# Critical for email functionality
PHP_ENV=production
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_specific_password

# Database connection
DB_HOST=localhost
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Site configuration
FRONTEND_URL=https://yourdomain.com
```

---

## 🚀 Final Deployment Checklist

- [ ] Files uploaded to Hostinger
- [ ] .env file configured with correct values
- [ ] Database credentials verified
- [ ] Gmail app password generated and set
- [ ] Email test completed successfully
- [ ] Registration test completed
- [ ] Error logs checked for issues

If you continue to have issues, check the debug tools and server error logs for specific error messages.