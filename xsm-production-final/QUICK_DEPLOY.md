# 🚀 XSM Market - Quick Deployment Checklist

## ⚡ BULLETPROOF 7-STEP DEPLOYMENT

### ✅ Step 1: Pre-Flight Check
```bash
cd xsm-production-final
node pre-deployment-health-check.js
```
**Must pass ALL checks before proceeding!**

### ✅ Step 2: Upload Files
- Upload root files (`index.html`, `assets/`, etc.) → `public_html/`
- Upload `api/` folder → `public_html/api/`

### ✅ Step 3: Create Database
- **hPanel → MySQL Databases**
- Database: `u718696665_xsm_market_db`
- User: `u718696665_xsm_user`
- Password: `HamzaZain123`
- Grant **ALL PRIVILEGES**

### ✅ Step 4: One-Click Setup
```bash
cd public_html/api
node deploy-hostinger.js
```

### ✅ Step 5: Configure Node.js App
- **hPanel → Node.js → Create App**
- App Root: `public_html/api`
- Startup File: `server.js`

### ✅ Step 6: Install & Start
```bash
cd public_html/api
npm install
```
Then click **"Start"** in hPanel Node.js panel

### ✅ Step 7: Verify
- Visit: `https://xsmmarket.com`
- Login: `admin@xsmmarket.com` / `admin123`

---

## 🚨 If Something Goes Wrong

```bash
cd public_html/api
node troubleshoot-deployment.js
```

## 📞 Emergency Reset

```bash
# Reset database
node setup-hostinger-database.js

# Full health check
cd .. && node pre-deployment-health-check.js
```

---

**That's it! Your XSM Market is live! 🎉**

*For detailed instructions, see `DEPLOYMENT_GUIDE.md`*
