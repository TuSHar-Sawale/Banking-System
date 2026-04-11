# Banking System - Setup Guide

This guide will help you set up and run the Banking System application locally.

## Prerequisites

Before starting, make sure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation: [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (Cloud): [Sign up free](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/banking-system.git
cd banking-system
```

### 2. MongoDB Setup

#### Option A: MongoDB Atlas (Cloud) - Recommended for beginners

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project (e.g., "Banking System")
4. Create a cluster (choose free tier)
5. In "Database Access", create a user with a strong password
6. In "Network Access", add your IP (or 0.0.0.0/0 for development)
7. Click "Connect" → "Connect your application"
8. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/bankingdb?retryWrites=true&w=majority`)
9. **Save this connection string** - you'll need it in the backend setup

#### Option B: Local MongoDB

```bash
# Windows
choco install mongodb-community

# macOS
brew tap mongodb/brew
brew install mongodb-community

# Linux
# Follow: https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod
```

### 3. Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create .env file from example
cp .env.example .env

# 3. Edit .env file with your settings
# Open .env and update:
#   - MONGO_URI: Your MongoDB connection string
#   - JWT_SECRET: A random 32+ character string (can use: openssl rand -base64 32)
#   - EMAIL_USER: Your Gmail address
#   - EMAIL_PASSWORD: Your Gmail App Password (see guide below)
#   - FRONTEND_URL: Keep as http://localhost:3000

# Windows PowerShell: use notepad .env
# macOS/Linux: use nano .env or your favorite editor
```

#### Setting up Gmail for Email Notifications

1. Open https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer" (or your device)
5. Google will generate a 16-character password
6. Copy this and paste it in `.env` as `EMAIL_PASSWORD`

### 4. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file (already provided, but you can check)
# The default VITE_API_URL=http://localhost:5000/api should work
```

### 5. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
# You should see: "Server running on port 5000"
```

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
# Frontend will start on http://localhost:3000
# Your browser should open automatically
```

## Testing the Application

### Create Test Accounts

1. **Customer Account:**
   - Go to Register page
   - Fill in details:
     - Name: John Doe
     - Email: john@example.com
     - Password: Test@1234
     - Phone: 9876543210
     - Address: Any address
   - Submit → Check email for OTP (printed in terminal)
   - Verify email → Login

2. **Admin Account:**
   - Register another account for admin
   - Then modify in MongoDB:
     ```javascript
     use bankingdb
     db.users.updateOne(
       { email: "admin@example.com" },
       { $set: { role: "admin" } }
     )
     ```
   - Login with this account to access admin features

### Test Features

#### Customer Features:
1. **Dashboard** - View accounts and recent transactions
2. **Accounts** - Create accounts (Savings, Current, Student)
3. **Deposits** - Click on account → Deposit (try ₹5000)
4. **Transfers** - Transfer → Select accounts → Enter amount
5. **Transactions** - View all transactions with filters
6. **Profile** - Update personal information

#### Admin Features:
1. **Admin Dashboard** - Overview of system statistics
2. **Manage Users** - Search and disable users
3. **Monitor Transactions** - View suspicious transactions
4. **Approve Loans** - Loan applications management

### Sample Test Data

```javascript
// Add to MongoDB to test
db.accounts.insertOne({
  accountNumber: "ACC123456",
  userId: ObjectId("..."),
  accountType: "savings",
  balance: 50000,
  status: "active"
})
```

## Troubleshooting

### "MongoDB connection failed"
- Check MongoDB is running (MongoDB Atlas is always running)
- Verify MONGO_URI in .env is correct
- Check network connection

### "Port 5000 already in use"
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### "OTP not received in email"
- Check .env EMAIL settings are correct
- Check backend terminal for email errors
- Gmail: Ensure App Password is used (not regular password)
- Check spam folder

### "CORS errors"
- Ensure backend is running on port 5000
- Check FRONTEND_URL in .env
- Restart both servers

### "Cannot find module"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## File Structure

```
banking-system/
├── backend/
│   ├── .env (create from .env.example)
│   ├── .env.example
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── package.json
├── frontend/
│   ├── .env
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Next Steps

1. **Customize** the application with your branding
2. **Deploy** to production:
   - Backend: Heroku, Railway, AWS
   - Frontend: Vercel, Netlify, GitHub Pages
   - Database: MongoDB Atlas (free tier available)

3. **Add features**:
   - Real-time notifications
   - Mobile app
   - Advanced reporting

## Useful Commands

```bash
# Backend development
npm run dev          # Start with hot reload
npm start            # Production start
npm test             # Run tests

# Frontend development
npm run dev          # Start Vite server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables Reference

### Backend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| MONGO_URI | MongoDB connection | mongodb+srv://... |
| JWT_SECRET | JWT signing key | random-32-char-string |
| EMAIL_USER | Gmail address | your-email@gmail.com |
| EMAIL_PASSWORD | Gmail App Password | 16-char-password |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

### Frontend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Support

- Check GitHub issues
- Review documentation in README.md
- Common issues in TROUBLESHOOTING section

## Happy Banking! 🏦

You're now ready to use the Banking System. Start with creating an account and exploring the features!
