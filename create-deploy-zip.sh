#!/bin/bash

echo "🚀 XSM Market - Creating Deployment ZIP"
echo "======================================="

# Create deployment directory
DEPLOY_DIR="xsm-hostinger-deploy"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

echo "📁 Creating deployment structure..."

# Create API directory
mkdir -p $DEPLOY_DIR/api

# Copy and create essential API files
echo "📄 Creating server.js..."
cat > $DEPLOY_DIR/api/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors({
  origin: ['https://xsmmarket.com', 'https://www.xsmmarket.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

let db;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'XSM Market API is running' });
});

// Get all ads
app.get('/api/ads', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.*, u.username as seller, u.email as sellerEmail 
      FROM ads a 
      LEFT JOIN users u ON a.userId = u.id 
      WHERE a.status = 'active' 
      ORDER BY a.createdAt DESC
    `);
    
    const formattedAds = {
      ads: rows.map(ad => ({
        id: ad.id,
        userId: ad.userId,
        title: ad.title,
        description: ad.description,
        channelUrl: ad.channelUrl,
        platform: ad.platform,
        category: ad.category,
        price: ad.price,
        subscribers: ad.subscribers || 0,
        monthlyIncome: ad.monthlyIncome || 0,
        isMonetized: ad.isMonetized || false,
        status: ad.status,
        verified: false,
        premium: false,
        views: 0,
        createdAt: ad.createdAt,
        seller: {
          id: ad.userId,
          username: ad.seller || 'Anonymous',
          profilePicture: null
        }
      }))
    };
    
    res.json(formattedAds);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// Create ad
app.post('/api/ads', async (req, res) => {
  try {
    const { title, description, channelUrl, platform, category, price, subscribers, monthlyIncome, isMonetized } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO ads (title, description, channelUrl, platform, category, price, subscribers, monthlyIncome, isMonetized, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, channelUrl, platform, category, price, subscribers || 0, monthlyIncome || 0, isMonetized || false, 1]
    );
    
    res.json({ id: result.insertId, message: 'Ad created successfully' });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// Auth endpoints (basic)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    
    if (users.length > 0) {
      res.json({ user: users[0], token: 'fake-token' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    res.json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

const PORT = process.env.PORT || 5000;

// Start server
async function startServer() {
  try {
    // Connect to database
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
    // Create tables if they don't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id int AUTO_INCREMENT PRIMARY KEY,
        username varchar(50) UNIQUE,
        email varchar(255) UNIQUE,
        password varchar(255),
        createdAt timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ads (
        id int AUTO_INCREMENT PRIMARY KEY,
        userId int,
        title varchar(255),
        description text,
        channelUrl varchar(500),
        platform varchar(50),
        category varchar(100),
        price decimal(10,2),
        subscribers int DEFAULT 0,
        monthlyIncome decimal(10,2) DEFAULT 0,
        isMonetized boolean DEFAULT false,
        status varchar(20) DEFAULT 'active',
        createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    
    // Insert sample user if not exists
    await db.execute(`
      INSERT IGNORE INTO users (id, username, email, password) 
      VALUES (1, 'admin', 'admin@xsmmarket.com', 'admin123')
    `);
    
    // Insert sample ads if none exist
    const [existingAds] = await db.execute('SELECT COUNT(*) as count FROM ads');
    if (existingAds[0].count === 0) {
      await db.execute(`
        INSERT INTO ads (userId, title, description, channelUrl, platform, category, price, subscribers, monthlyIncome, isMonetized) VALUES
        (1, 'Gaming Channel - 50K Subs', 'Popular gaming channel with engaged audience', 'https://youtube.com/channel1', 'youtube', 'Gaming', 2500.00, 50000, 800.00, true),
        (1, 'Tech Reviews - 30K Subs', 'Tech review channel with sponsorship deals', 'https://youtube.com/channel2', 'youtube', 'Tech', 1800.00, 30000, 600.00, true),
        (1, 'Cooking TikTok - 75K Followers', 'Viral cooking content', 'https://tiktok.com/@cooking', 'tiktok', 'Food', 800.00, 75000, 400.00, false),
        (1, 'Lifestyle Instagram - 25K Followers', 'Fashion and lifestyle content', 'https://instagram.com/lifestyle', 'instagram', 'Lifestyle', 1200.00, 25000, 300.00, true)
      `);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 XSM Market API running on port ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
EOF

echo "📄 Creating .env file..."
cat > $DEPLOY_DIR/api/.env << 'EOF'
# Production MariaDB Configuration for Hostinger
DB_HOST=localhost
DB_NAME=u718696665_xsm_market_db
DB_USER=u718696665_xsm_user
DB_PASSWORD=HamzaZain123
DB_PORT=3306

# Application Settings
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=xsm-market-secret-key-2025
JWT_REFRESH_SECRET=xsm-market-refresh-secret-key-2025

# Google OAuth Configuration
GOOGLE_CLIENT_ID=706026691678-kbn3pqlj9f5t7o8sri6lf5ucgi03btjb.apps.googleusercontent.com

# Email Configuration
GMAIL_USER=Tiktokwaalii2@gmail.com
GMAIL_APP_PASSWORD=ytaj wcfp kpya ziqj

# Frontend URLs for Production
VITE_API_URL=https://xsmmarket.com/api
VITE_FRONTEND_URL=https://xsmmarket.com
FRONTEND_URL=https://xsmmarket.com
EOF

echo "📄 Creating package.json..."
cat > $DEPLOY_DIR/api/package.json << 'EOF'
{
  "name": "xsm-market-api",
  "version": "1.0.0",
  "description": "XSM Market API for Hostinger",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1"
  }
}
EOF

echo "🌐 Building frontend..."
# Build frontend
if [ -f "package.json" ]; then
  npm run build
  if [ -d "dist" ]; then
    cp -r dist/* $DEPLOY_DIR/
    echo "✅ Frontend built and copied"
  else
    echo "⚠️ Frontend build failed, copying static files..."
    cp index.html $DEPLOY_DIR/ 2>/dev/null || echo "No index.html found"
  fi
else
  echo "⚠️ No package.json found, creating basic index.html..."
  cat > $DEPLOY_DIR/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XSM Market</title>
</head>
<body>
    <h1>XSM Market</h1>
    <p>Site is being deployed...</p>
    <a href="/api/health">Check API Health</a>
</body>
</html>
EOF
fi

echo "📄 Creating deployment instructions..."
cat > $DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt << 'EOF'
🚀 XSM MARKET HOSTINGER DEPLOYMENT

1. UPLOAD FILES:
   - Upload ALL files to public_html/
   - Make sure api/ folder is in public_html/api/

2. CREATE DATABASE:
   - Go to hPanel → MySQL Databases
   - Create database: u718696665_xsm_market_db
   - Create user: u718696665_xsm_user
   - Password: HamzaZain123
   - Grant ALL PRIVILEGES

3. INSTALL DEPENDENCIES:
   SSH to your server and run:
   cd public_html/api
   npm install

4. START SERVER:
   pm2 start server.js --name "xsm-market-api"
   pm2 save

5. TEST:
   Visit: https://xsmmarket.com/api/health
   Should show: {"status":"OK","message":"XSM Market API is running"}

6. TROUBLESHOOT:
   pm2 logs xsm-market-api
   pm2 restart xsm-market-api

That's it! Your site will be live at https://xsmmarket.com
EOF

echo "📦 Creating ZIP file..."
zip -r xsm-hostinger-deploy.zip $DEPLOY_DIR/

echo ""
echo "🎉 DEPLOYMENT ZIP READY!"
echo "======================================="
echo "✅ File created: xsm-hostinger-deploy.zip"
echo "📤 Upload this ZIP to Hostinger File Manager"
echo "📂 Extract it to public_html/"
echo "📖 Follow DEPLOY_INSTRUCTIONS.txt"
echo ""
echo "🔗 Your site will be live at: https://xsmmarket.com"
echo "🔗 API health check: https://xsmmarket.com/api/health"
echo ""

# Clean up
rm -rf $DEPLOY_DIR
