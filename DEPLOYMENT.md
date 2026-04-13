# Deployment Guide to Vercel

This project is a full-stack banking system with a React frontend and Express.js backend. Follow these steps to deploy to Vercel.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (https://vercel.com)
- All required environment variables

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** and select **"Project"**
3. Select **"Import Git Repository"**
4. Search for and select your banking project repository
5. Click **"Import"**

### 2. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

#### Required Variables (from backend/.env.example):

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bankingdb
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_at_least_32_characters
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM=Banking System <noreply@banking.com>
OTP_EXPIRY=10m
OTP_LENGTH=6
BCRYPT_ROUNDS=10
FRONTEND_URL=https://your-vercel-deployment-url.vercel.app
ENABLE_LOANS=true
ENABLE_NOTIFICATIONS=true
FRAUD_DETECTION_ENABLED=true
```

### 3. Configure Build Settings

**Build Command:** Should be auto-detected, but ensure it matches:
```
npm install --legacy-peer-deps && npm run build
```

**Output Directory:** 
```
frontend/dist
```

**Install Command:**
```
npm install --legacy-peer-deps
```

### 4. Deploy

1. Review the import settings
2. Click **"Deploy"**
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Once complete, you'll get a deployment URL

## Project Structure

```
.
├── frontend/          # React + Vite application
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── dist/          # Build output
├── backend/           # Express.js API server
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── package.json
│   └── .env.example
├── vercel.json        # Root deployment config
└── package.json       # Root package.json (monorepo)
```

## Environment Variables Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT token signing | Generated secret (32+ chars) |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens | Generated secret (32+ chars) |
| `EMAIL_USER` | Gmail account for sending emails | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password (not regular password) | `xxxx xxxx xxxx xxxx` |
| `FRONTEND_URL` | Your deployed frontend URL | `https://your-app.vercel.app` |

## Email Setup (Gmail)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate an app password for "Mail" and "Windows Computer"
5. Copy the 16-character password and use it as `EMAIL_PASSWORD`

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Ensure MongoDB connection string is valid
- Check logs in Vercel dashboard for specific errors

### Frontend Not Displaying

- Verify `FRONTEND_URL` matches your Vercel deployment domain
- Check CORS settings in backend (frontend/dist should be served automatically)

### API Requests 404

- Ensure API routes are properly configured in `/api/` path
- Check that backend server.js is properly configured for serverless environment

## Post-Deployment

1. Test the deployed application at your Vercel URL
2. Verify authentication works
3. Test a few transactions to ensure database connectivity
4. Monitor the Vercel dashboard for errors

## Continuous Deployment

Once deployed, any push to your main branch will automatically trigger a new deployment. You can also manually trigger deployments from the Vercel dashboard.

## Support

For issues, check:
- Vercel documentation: https://vercel.com/docs
- Backend logs: Vercel dashboard → Deployments → Logs
- Frontend build: Check the build output in Vercel dashboard
