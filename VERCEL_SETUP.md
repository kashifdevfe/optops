# Vercel Deployment Setup Guide

## CRITICAL: Environment Variables Setup

### Frontend (optops-f7dh.vercel.app)

Go to your Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add this variable:

```
Name: VITE_API_URL
Value: https://backend-8bufyhvwf-kashifmhmds-projects.vercel.app
```

**Important:** After adding this, you MUST redeploy your frontend for the changes to take effect.

### Backend (backend-8bufyhvwf-kashifmhmds-projects.vercel.app)

Make sure you have these environment variables set:

```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secret_key_here
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=production
```

## Quick Fix Steps

1. **Add the environment variable to Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your frontend project (optops-f7dh)
   - Go to Settings → Environment Variables
   - Add `VITE_API_URL` with value `https://backend-8bufyhvwf-kashifmhmds-projects.vercel.app`
   - Click "Save"

2. **Redeploy your frontend:**
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"
   - OR just push a new commit to trigger automatic deployment

3. **Test:**
   - Open https://optops-f7dh.vercel.app
   - Try to login
   - CORS error should be gone!

## Alternative: Use Vercel CLI

If you have Vercel CLI installed:

```bash
cd frontend
vercel env add VITE_API_URL
# Enter: https://backend-8bufyhvwf-kashifmhmds-projects.vercel.app
# Select: Production

# Redeploy
vercel --prod
```

## Why This Fixes CORS

- Your frontend was trying to call `/api` (relative path)
- On Vercel, this becomes `https://optops-f7dh.vercel.app/api` which doesn't exist
- By setting `VITE_API_URL`, it now calls the correct backend URL
- The backend is already configured to accept requests from your frontend domain
