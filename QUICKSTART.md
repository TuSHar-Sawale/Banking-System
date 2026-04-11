# Quick Start - 5 Minutes Setup

## TL;DR - Get Running in 5 Minutes

### 1. Clone & Install (2 min)
```bash
git clone https://github.com/yourusername/banking-system.git
cd banking-system

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure MongoDB (1 min)
- Sign up free at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string (mongodb+srv://...)

### 3. Configure Environment (2 min)
**Backend/.env**
```
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<random-32-char-string>
EMAIL_USER=<your-gmail>
EMAIL_PASSWORD=<gmail-app-password>
```

### 4. Run Both Servers (Terminal 1 & 2)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open `http://localhost:3000` → Done! 🎉

## First 5 Minutes of Use

1. **Register** - Create a customer account
2. **Verify Email** - Enter OTP from terminal
3. **Login** - Use your credentials
4. **Create Account** - Add a savings account
5. **Deposit** - Add ₹5000 to test

## Key Credentials for Testing

| Account | Purpose |
|---------|---------|
| First registered user | Customer (transfer, deposits) |
| Second user (role changed to admin) | Admin dashboard |

## API Status
- Backend: `http://localhost:5000/api/health`
- Frontend: `http://localhost:3000`

## Need Help?
- See **SETUP_GUIDE.md** for detailed setup
- See **README.md** for full documentation
- Check backend terminal for errors

---

**Happy Banking!** 🏦💰
