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

# 3. Create local database (make sure MySQL/MariaDB is running)
npm run db:setup

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
npm run db:setup         # Create database tables
npm run build            # Build for production
npm run clean            # Clean node_modules and builds
```

## 🗄️ Database Setup

The app uses MariaDB/MySQL. Make sure it's running locally, then:

1. **Install MariaDB/MySQL** on your machine
2. **Start the service**:
   - macOS: `brew services start mariadb`
   - Linux: `sudo systemctl start mariadb`
   - Windows: Start via Services or XAMPP
3. **Run setup**: `npm run db:setup`

Default database config (can be changed in `backend/.env`):
- Host: localhost
- Database: xsm_market_local
- User: root
- Password: (empty - update if needed)

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
