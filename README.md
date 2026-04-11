# Banking System 💰

A full-stack banking application built with **Node.js/Express** backend and **React** frontend. Features secure user authentication, account management, fund transfers, loan management, and admin dashboard.

## Features

### 🔐 Security & Authentication
- Secure user registration with email verification via OTP
- JWT-based authentication with token refresh mechanism
- Password hashing with bcryptjs
- Role-based access control (Customer & Admin)
- Email notifications for transactions

### 💼 User Features
- **Accounts**: Create and manage multiple bank accounts (Savings, Current, Student)
- **Transactions**: Deposit, withdraw, and transfer money between accounts
- **Transaction History**: View detailed transaction records with filtering
- **Profile Management**: Update personal information and address
- **Dashboard**: Real-time balance overview and recent activity

### 🛡️ Advanced Features
- **Fraud Detection**: Automatic flagging of suspicious transactions based on risk scores
- **Loan Management**: Apply for loans, track payments, and view payment schedules
- **Interest Calculation**: Automatic EMI calculation for loans
- **Transaction Limits**: Monthly transaction limits per account type

### 👨‍💼 Admin Features
- **Dashboard**: Comprehensive statistics and analytics
- **User Management**: View, search, and manage user accounts
- **Transaction Monitoring**: Monitor suspicious transactions with fraud scores
- **Loan Approval**: Review and approve/reject loan applications
- **Account Freeze**: Freeze accounts for suspicious activity
- **Activity Logs**: Access user activity and transaction history

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios (with interceptors)
- **Notifications**: react-toastify
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas cloud)
- Git

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/banking-system.git
cd banking-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
cp .env.example .env

# Configure your MongoDB URI and other settings in .env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bankingdb
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Start the server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure API URL (default is correct for local development)
VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile

### Accounts
- `POST /api/account/create-account` - Create new account
- `GET /api/account/accounts/:userId` - Get all user accounts
- `GET /api/account/account/:accountId` - Get account details
- `GET /api/account/summary/:userId` - Get account summary
- `PUT /api/account/update-profile/:userId` - Update user profile
- `POST /api/account/freeze/:accountId` - Freeze account (admin)
- `DELETE /api/account/deactivate/:accountId` - Close account

### Transactions
- `POST /api/transactions/deposit` - Deposit money
- `POST /api/transactions/withdraw` - Withdraw money
- `POST /api/transactions/transfer` - Transfer between accounts
- `GET /api/transactions/history/:userId` - Get transaction history
- `GET /api/transactions/:transactionId` - Get transaction details

### Loans
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans/:loanId` - Get loan details
- `GET /api/loans/user/:userId` - Get user's loans
- `POST /api/loans/:loanId/payment` - Process loan payment
- `GET /api/loans/:loanId/schedule` - Get payment schedule
- `POST /api/loans/:loanId/activate` - Activate approved loan

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/status` - Update user status
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/transactions/suspicious` - Get suspicious transactions
- `GET /api/admin/accounts-review` - Get accounts for review
- `GET /api/admin/loans/pending` - Get pending loan applications
- `PUT /api/admin/loans/:loanId` - Approve/reject loan

## Database Schema

### Users
```javascript
{
  name, email, password, phone,
  address: { street, city, state, zipCode },
  role: "customer" | "admin",
  isEmailVerified, isPhoneVerified,
  status: "active" | "disabled" | "suspended"
}
```

### Accounts
```javascript
{
  accountNumber, userId, accountType: "savings" | "current" | "student",
  balance, status: "active" | "frozen" | "closed",
  monthlyTransactionLimit, transactionsThisMonth
}
```

### Transactions
```javascript
{
  transactionId, senderId, receiverId, amount,
  type: "deposit" | "withdraw" | "transfer" | "loan_payment",
  status: "pending" | "completed" | "failed",
  metadata: { fraudScore, flagged },
  timestamp
}
```

### Loans
```javascript
{
  loanId, userId, principal, interestRate, term,
  status: "pending" | "approved" | "active" | "closed",
  emi, totalAmount, paidAmount, remainingAmount,
  paymentHistory, nextPaymentDate
}
```

## Configuration

### Environment Variables

**Backend (.env)**
```
MONGO_URI=mongodb+srv://...
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Banking System <noreply@banking.com>"
OTP_EXPIRY=10m
OTP_LENGTH=6
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

## Usage

### Running the Application

1. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Open `http://localhost:3000` in your browser
   - Register a new account
   - Verify email with OTP
   - Explore features!

### Test Accounts

After running the application, create accounts using the registration page.

**For Admin Features:**
- Create an admin account by manually updating user role in MongoDB:
  ```javascript
  db.users.updateOne({ email: "admin@email.com" }, { $set: { role: "admin" } })
  ```

## Project Structure

```
banking-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, role-based access
│   ├── utils/           # Helper functions
│   ├── .env             # Environment variables
│   ├── server.js        # Express app
│   └── package.json
│
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── api/         # Axios configuration
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   ├── App.jsx      # Main app component
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Global styles
│   ├── vite.config.js   # Vite configuration
│   ├── .env             # Environment variables
│   └── package.json
│
└── README.md
```

## Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests (if configured)

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security Features

1. **Password Security**: bcryptjs hashing with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Token Refresh**: Automatic token refresh with refresh tokens
4. **CORS**: Cross-origin resource sharing configured
5. **Input Validation**: Server-side validation on all endpoints
6. **Role-Based Access**: Admin-only endpoints protected
7. **Fraud Detection**: Automatic transaction flagging
8. **Email Verification**: OTP-based email verification

## Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] SMS alerts for transactions
- [ ] Mobile app with React Native
- [ ] Advanced analytics and reporting
- [ ] Investment portfolio management
- [ ] Digital currency support
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication
- [ ] Payment gateway integration

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@bankingsystem.com or open an issue in the GitHub repository.

## Acknowledgments

- Express.js documentation
- MongoDB documentation
- React documentation
- Tailwind CSS for styling
- All contributors and users

---

**Made with ❤️ for secure banking**
