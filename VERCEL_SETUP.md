# Vercel Deployment Checklist

## Project Structure ✅
- [x] Monorepo with `/frontend` and `/backend` directories
- [x] Root `package.json` for monorepo configuration
- [x] Root `vercel.json` for build and deployment configuration
- [x] `.vercelignore` for excluding unnecessary files

## Configuration Files ✅
- [x] `vercel.json` - Main deployment configuration
- [x] `backend/vercel.json` - Backend configuration
- [x] `.vercelignore` - Files to ignore during deployment
- [x] `DEPLOYMENT.md` - Full deployment guide
- [x] Frontend `.env.example` - Frontend environment variables
- [x] Backend `.env.example` - Backend environment variables (already exists)

## Package.json Updates ✅
- [x] Root `package.json` - Monorepo workspace configuration
- [x] `backend/package.json` - Updated with proper scripts and Node engines
- [x] `frontend/package.json` - Added Node engines specification

## Frontend Configuration ✅
- [x] `frontend/vite.config.js` - Optimized for production builds
- [x] `frontend/.env.example` - Frontend environment variables

## Backend Configuration ✅
- [x] API routes configured for Vercel
- [x] CORS properly configured with FRONTEND_URL variable
- [x] Environment variable setup

## Before Deploying

### 1. Verify All Files Are Committed
```bash
git add .
git commit -m "Prepare project for Vercel deployment"
git push
```

### 2. Test Locally
```bash
# Install dependencies
npm install

# Run backend
npm run dev --workspace=backend

# In another terminal, run frontend
npm run dev --workspace=frontend
```

### 3. Set Up Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Set the following environment variables in Vercel dashboard:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Generate a random secret (32+ characters)
   - `REFRESH_TOKEN_SECRET` - Generate a random secret
   - `EMAIL_USER` - Gmail account
   - `EMAIL_PASSWORD` - Gmail app password
   - `EMAIL_FROM` - From address for emails
   - `FRONTEND_URL` - Will be assigned by Vercel
   - All other variables from `.env.example`

### 4. Deploy
- Vercel will automatically deploy on git push
- Watch the deployment logs in Vercel dashboard

## Project Statistics
- **Frontend**: React 18 + Vite 5 + React Router
- **Backend**: Express.js with MongoDB
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Refresh Tokens
- **Email**: Nodemailer (Gmail SMTP)

## Important Notes

1. **FRONTEND_URL**: Set to your Vercel deployment URL after first deployment
2. **MONGO_URI**: Must be a MongoDB Atlas connection string
3. **Email**: Requires Gmail with 2FA and App Passwords
4. **Build Time**: Typically 2-5 minutes first time, faster on subsequent deployments
5. **Cold Starts**: First request may take 10-15 seconds due to serverless cold start

## Troubleshooting
- See DEPLOYMENT.md for detailed troubleshooting guide
- Check Vercel dashboard logs for build/runtime errors
- Ensure all environment variables are set correctly

## Post-Deployment
- Test all API endpoints
- Test authentication flow
- Verify email sending works
- Check database operations
- Monitor Vercel dashboard for errors
