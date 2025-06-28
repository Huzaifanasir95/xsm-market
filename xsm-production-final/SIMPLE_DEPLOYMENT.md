# 🚀 XSM Market - Simple Hostinger Deployment

## 📦 Quick Setup Guide

### Step 1: Upload Files
1. Upload all files from `xsm-production-final/` root to your Hostinger `public_html/`
2. Upload all files from `api/` folder to `public_html/api/`

### Step 2: One-Command Database Setup
```bash
# SSH into your Hostinger server or use Terminal in File Manager
cd public_html/api

# Install dependencies (if not already installed)
npm install

# Run the automatic database setup script
node setup-hostinger-database.js
```

That's it! The script will:
- ✅ Connect to your database
- ✅ Create all tables (users, ads)
- ✅ Set up foreign key relationships  
- ✅ Insert sample data
- ✅ Create admin accounts

### Step 3: Configure Node.js App
1. In Hostinger hPanel, go to **Node.js**
2. Create application:
   - **Entry point**: `server.js`
   - **Application folder**: `/public_html/api`
   - **Environment**: Production
3. Click **Start Application**

### Step 4: Test Your Site
- **Frontend**: https://xsmmarket.com
- **API Health**: https://xsmmarket.com/api/health
- **Login**: Use `hamzasheikh1228@gmail.com` / `admin123`

## 🔧 Database Configuration

Your `.env` file is already configured with Hostinger settings:

```env
# Hostinger Database Settings
DB_HOST=127.0.0.1
DB_NAME=u718696665_xsm_market_db
DB_USER=u718696665_xsm_user
DB_PASSWORD=HamzaZain123
DB_PORT=3306

# Production Settings
NODE_ENV=production
PORT=5000
VITE_API_URL=https://xsmmarket.com/api
```

## 🎯 What the Setup Script Does

The `setup-hostinger-database.js` script automatically:

1. **Connects** to your Hostinger MySQL database
2. **Creates** the complete database schema:
   - `users` table (authentication, profiles)
   - `ads` table (channel listings)
   - All relationships and constraints
3. **Inserts** sample data:
   - Admin user account
   - Test user account  
   - Sample channel listings
4. **Verifies** everything is working correctly

## 🔑 Default Accounts

After setup, you can login with:

**Admin Account:**
- Email: `admin@xsmmarket.com`
- Password: `admin123`

**Test User Account:**
- Email: `hamzasheikh1228@gmail.com`  
- Password: `admin123`

## ⚡ Quick Commands

```bash
# Setup database
npm run setup-hostinger

# Start server
npm start

# Development mode (if needed)
npm run dev
```

## 🆘 Troubleshooting

**Database Connection Failed?**
1. Check database exists in Hostinger hPanel → MySQL Databases
2. Verify credentials in `.env` file
3. Ensure database user has full permissions

**Script Won't Run?**
1. Make sure you're in the `api/` directory
2. Run `npm install` first to install dependencies
3. Check Node.js version (should be 16+ or latest LTS)

**App Not Starting?**
1. Check Node.js app is configured correctly in hPanel
2. Verify `server.js` is set as entry point
3. Check application logs in hPanel for errors

---

🎉 **Your XSM Market is now live at https://xsmmarket.com!**
