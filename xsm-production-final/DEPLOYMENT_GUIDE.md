# 🚀 XSM Market - Production Deployment Guide

## 📋 Overview
This package contains the complete XSM Market application ready for deployment on Hostinger.

## 📁 Package Structure
```
xsm-production-final/
├── index.html              # Frontend entry point
├── assets/                 # Frontend static assets (CSS, JS, images)
├── favicon.ico            # Site favicon
├── robots.txt             # SEO robots file
└── api/                   # Backend API folder
    ├── server.js          # Main server file
    ├── .env               # Environment variables
    ├── package.json       # Node.js dependencies
    ├── database-schema.sql # Database schema
    ├── config/            # Database configuration
    ├── controllers/       # API controllers
    ├── middleware/        # Authentication middleware
    ├── models/           # Database models
    ├── routes/           # API routes
    └── utils/            # Utility functions
```

## 🌐 Deployment Steps

### Step 1: Upload Files to Hostinger

1. **Login to Hostinger hPanel**
   - Go to your Hostinger control panel
   - Navigate to "File Manager"

2. **Upload Frontend Files**
   - Upload all files from the root directory (`index.html`, `assets/`, etc.) to `public_html/`
   - Your domain (xsmmarket.com) will serve these files

3. **Upload Backend Files**
   - Create a folder named `api` in `public_html/`
   - Upload all files from the `api/` folder to `public_html/api/`

### Step 2: Setup Database

1. **Create MySQL Database**
   - In hPanel, go to "MySQL Databases"
   - Database name: `u718696665_xsm_market_db`
   - Username: `u718696665_xsm_user` 
   - Password: `HamzaZain123`

2. **Import Database Schema**
   - Go to phpMyAdmin in hPanel
   - Select your database
   - Click "Import"
   - Upload the `database-schema.sql` file
   - Click "Go" to create tables

### Step 3: Configure Node.js Application

1. **Setup Node.js App**
   - In hPanel, go to "Node.js"
   - Click "Create Application"
   - Configure:
     - Entry point: `server.js`
     - Application folder: `/public_html/api`
     - Environment: `Production`
     - Node.js version: Latest LTS

2. **Install Dependencies**
   - In the Node.js app panel, click "Install Dependencies"
   - Or manually install: `npm install`

3. **Environment Variables**
   The `.env` file is already configured with production settings:
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=localhost
   DB_NAME=u718696665_xsm_market_db
   DB_USER=u718696665_xsm_user
   DB_PASSWORD=HamzaZain123
   JWT_SECRET=xsm-market-secret-key-2025
   GOOGLE_CLIENT_ID=706026691678-kbn3pqlj9f5t7o8sri6lf5ucgi03btjb.apps.googleusercontent.com
   GMAIL_USER=Tiktokwaalii2@gmail.com
   GMAIL_APP_PASSWORD=ytaj wcfp kpya ziqj
   FRONTEND_URL=https://xsmmarket.com
   ```

4. **Start the Application**
   - Click "Start Application" in the Node.js panel
   - The API will be available at `https://xsmmarket.com/api`

### Step 4: Domain Configuration

1. **SSL Certificate**
   - In hPanel, go to "SSL"
   - Enable SSL for your domain
   - This enables HTTPS access

2. **Verify Setup**
   - Frontend: `https://xsmmarket.com`
   - API Health Check: `https://xsmmarket.com/api/health`

## ✅ Testing Your Deployment

### Frontend Test
1. Visit `https://xsmmarket.com`
2. You should see the XSM Market homepage
3. Try navigating between pages

### Backend API Test
1. Visit `https://xsmmarket.com/api/health`
2. You should see: `{"status":"OK","message":"XSM Market API is running",...}`

### Full App Test
1. Try creating an account
2. Login with your credentials
3. Create a test ad listing
4. Verify it appears on the homepage

## 🔧 Troubleshooting

### Common Issues

**1. API Not Working**
- Check Node.js app is running in hPanel
- Verify environment variables are set
- Check server logs in Node.js panel

**2. Database Connection Failed**
- Verify database credentials in `.env`
- Ensure database exists and user has permissions
- Check if database schema was imported correctly

**3. CORS Errors**
- Verify domain is listed in CORS origins in `server.js`
- Check if HTTPS is enabled

**4. Frontend Not Loading**
- Ensure files are uploaded to `public_html/` root
- Check if `index.html` exists in domain root
- Verify file permissions

### Server Logs
- Check Node.js application logs in hPanel for detailed error messages
- API logs include request details and error information

## 📧 Support Information

**Admin User Credentials:**
- Email: `hamzasheikh1228@gmail.com`
- Password: `Hello12@`

**Database Access:**
- Host: `localhost`
- Database: `u718696665_xsm_market_db`
- Username: `u718696665_xsm_user`
- Password: `HamzaZain123`

## 🎉 Success!

Once deployed, your XSM Market application will be live at:
- **Website**: https://xsmmarket.com
- **API**: https://xsmmarket.com/api

The platform allows users to buy and sell social media channels with features like:
- User authentication and profiles
- Channel listings with detailed information
- Search and filtering capabilities
- Secure ad creation and management
- Responsive design for all devices

---

**Deployment Date:** $(date)
**Version:** 1.0.0
**Status:** Production Ready ✅
