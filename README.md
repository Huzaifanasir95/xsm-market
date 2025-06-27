# XSM Market

A complete full-stack marketplace application with user authentication and modern UI.

## 🚀 How to Run for Development

### Prerequisites
- Node.js 18+
- MariaDB/MySQL running locally
- Git

### Step-by-Step Setup
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd xsm-market

# 2. Setup everything automatically
npm run setup-local

# 3. Setup local database (automated script)
npm run db:setup-local

# 4. Start development servers
npm run dev
```

### Your app will run at:
- **Frontend**: http://localhost:5173 (React app)
- **Backend**: http://localhost:5000 (API server)
- **API Endpoints**: http://localhost:5000/api/*

## 🔧 Development Commands

```bash
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Start only React frontend
npm run dev:backend      # Start only Node.js backend
npm run db:setup-local   # Setup local database (automated)
npm run db:setup         # Setup database tables only
npm run build            # Build for production
npm run clean            # Clean node_modules and builds
```

## 🗄️ Database Setup (Automated)

The app uses MariaDB/MySQL. I've created an automated setup script that handles everything:

**Option 1: Automated Setup (Recommended)**
```bash
# This script will:
# - Check if MySQL/MariaDB is installed
# - Test connection
# - Create database
# - Setup tables
# - Update .env file
npm run db:setup-local
```

**Option 2: Manual Setup**
1. **Install MariaDB/MySQL** on your machine
2. **Start the service**:
   - macOS: `brew services start mariadb`
   - Linux: `sudo systemctl start mariadb`
   - Windows: Start via Services or XAMPP
3. **Run setup**: `npm run db:setup`

The automated script will ask for your database password and handle everything else automatically!

## 🔍 Troubleshooting Database Setup

If you encounter issues with the database setup:

**1. Connection Issues**
```bash
# Check if MariaDB/MySQL is running
brew services list | grep mariadb    # macOS
sudo systemctl status mariadb        # Linux
```

**2. Permission Issues**
```bash
# Reset root password (if needed)
sudo mysql_secure_installation
```

**3. Manual Database Creation**
```sql
-- Connect to MySQL/MariaDB
mysql -u root -p

-- Create database manually
CREATE DATABASE xsm_market_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

-- Then run: npm run db:setup
```

**4. Script Permissions (Unix/macOS)**
```bash
chmod +x scripts/setup-local-db.sh
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Sequelize ORM
- **Database**: MariaDB/MySQL
- **Auth**: JWT tokens with refresh functionality

## 📁 Project Structure

```
xsm-market/
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── services/          # API calls
│   └── context/           # React context
├── backend/               # Node.js API
│   ├── controllers/       # Business logic
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── middleware/       # Express middleware
└── public/               # Static assets
```

## 🎯 Key Features

- ✅ User registration & login
- ✅ Email verification
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Modern responsive UI
- ✅ Database migrations

## 🔧 Environment Files

After running `npm run setup-local`, these files are created:

**Frontend (`.env.local`)**:
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (`backend/.env`)**:
```env
DB_HOST=localhost
DB_NAME=xsm_market_local
DB_USER=root
DB_PASSWORD=
# ... other settings
```

Update the database password in `backend/.env` if your MySQL/MariaDB has a password.

---

**Ready to start developing!** 🚀
