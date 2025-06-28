# XSM Market - Hostinger Deployment Guide

## 🚀 Fresh Production Deployment

This deployment package creates a completely clean production environment with zero test data.

## 📋 Deployment Steps

### 1. Upload to Hostinger
- Upload `xsm-final-clean.zip` to your Hostinger file manager
- Extract it to your `public_html/` directory

### 2. Install Dependencies
```bash
cd public_html/api
npm install
```

### 3. Clean Database (IMPORTANT!)
```bash
npm run clean-db
```
This will:
- Remove ALL existing users and ads
- Create fresh, empty tables
- Reset auto-increment counters
- Give you a completely clean start

### 4. Stop existing server (if running)
```bash
pm2 stop xsm-api || true
pm2 delete xsm-api || true
```

### 5. Start the API
```bash
pm2 start server.js --name xsm-api
```

### 6. Check status
```bash
pm2 status
pm2 logs xsm-api
```

## 📊 What You Get

- **👥 Users:** 0 (completely clean)
- **📢 Ads:** 0 (completely clean)
- **🎯 Result:** Fresh production environment ready for real users

## 🔧 Configuration

- Database settings are in `api/.env`
- Frontend points to your domain
- CORS configured for your domain
- Production optimized

## ✅ Verification

After deployment, visit:
- `https://yourdomain.com` - Frontend
- `https://yourdomain.com/api/health` - API health check
- `https://yourdomain.com/api/ads` - Should return empty array

## 🎉 Ready!

Your XSM Market is now live with a completely clean database, ready for real users to register and create ads.

---
*Deployment package created: $(date)*
