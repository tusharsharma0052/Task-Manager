# Railway Deployment Guide

This guide will help you deploy the Task Manager application on Railway.

## Prerequisites

1. **Railway Account** - Sign up at [railway.app](https://railway.app)
2. **GitHub Account** - Repository with this project
3. **MongoDB Atlas Account** - For database hosting

## Step 1: Prepare Your Repository

1. Create a GitHub repository and push this project
2. Update `.gitignore` to exclude:
   ```
   node_modules/
   .env
   .DS_Store
   dist/
   build/
   ```

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/task-manager?retryWrites=true&w=majority
   ```

## Step 3: Deploy Backend to Railway

### 3a. Create Backend Service

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repository
4. Choose the root directory as `/backend`
5. Click **"Deploy"**

### 3b. Configure Backend Environment Variables

In Railway Dashboard for your backend service:

1. Go to **Variables** tab
2. Add the following environment variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate a strong random secret (min 32 chars) |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (or leave empty - Railway auto-assigns) |
| `FRONTEND_URL` | Your Railway frontend URL (update after frontend deployment) |

**Generate a secure JWT_SECRET:**
```bash
# Run this in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3c. Configure Build & Deploy Settings

In Railway Dashboard:

1. Go to **Settings** tab
2. Set **Start Command**:
   ```
   npm install && npm start
   ```
3. Or create `Procfile` in backend root:
   ```
   web: npm start
   ```

### 3d. Get Backend URL

After deployment completes:
1. Go to **Settings** tab
2. Find **Domain** section
3. Copy your Railway-assigned domain (e.g., `https://taskmanager-backend.railway.app`)

## Step 4: Deploy Frontend to Railway

### 4a. Create Frontend Service

1. Create a new project or add service to existing project
2. Click **"New Service"** → **"Deploy from GitHub"**
3. Select your repository
4. Choose the root directory as `/frontend`

### 4b. Configure Frontend Environment Variables

In Railway Dashboard for frontend service:

1. Go to **Variables** tab
2. Add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your backend URL from Step 3d (e.g., `https://taskmanager-backend.railway.app/api`) |

### 4c. Configure Build Command

In Railway Dashboard:

1. Go to **Settings** tab
2. Set **Build Command**:
   ```
   npm install && npm run build
   ```
3. Set **Start Command** (if required):
   ```
   npm run preview
   ```

Or create `railway.toml` in project root:
```toml
[build]
builder = "nixpacks"

[build.buildpacks]
nixpacks = ["nodejs"]
```

### 4d. Get Frontend URL

After deployment completes:
1. Copy your Railway-assigned domain (e.g., `https://taskmanager-frontend.railway.app`)

## Step 5: Update CORS Configuration

Go back to **Backend Service** in Railway:

1. Update `FRONTEND_URL` variable with your frontend URL from Step 4d
2. Redeploy backend:
   ```
   - Click "Reposition" or make a git commit to trigger redeploy
   ```

## Step 6: Test the Deployment

1. Open your frontend URL: `https://taskmanager-frontend.railway.app`
2. Sign up with an **Admin** role
3. Access the admin panel
4. Verify all features work

## Environment Variables Summary

### Backend (.env)
```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/task-manager
JWT_SECRET=your_long_secure_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.railway.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure `FRONTEND_URL` environment variable is set correctly in backend

### Issue: API calls fail with 404
**Solution**: Verify `VITE_API_URL` includes `/api` at the end

### Issue: Database connection fails
**Solution**: 
- Check MongoDB Atlas connection string is correct
- Ensure your IP is whitelisted in MongoDB Atlas (use 0.0.0.0/0 for Railway)
- Test connection string locally first

### Issue: Frontend builds but shows blank page
**Solution**:
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Check that backend service is running

## Monitoring & Logs

In Railway Dashboard:

1. Go to **Logs** tab to view application logs
2. Go to **Metrics** to monitor CPU, memory, and network usage
3. Use **Deployments** tab to see deployment history

## Performance Tips

1. **Database**: 
   - Enable indexes in MongoDB Atlas
   - Use proper query optimization

2. **Frontend**:
   - Enable gzip compression
   - Use CDN for static assets

3. **Backend**:
   - Set up proper caching headers
   - Monitor error rates in logs

## Scaling

As your app grows:

1. **Database**: Upgrade MongoDB Atlas cluster tier
2. **Backend**: Railway handles scaling automatically
3. **Frontend**: Already static, very scalable

## Security Checklist

- [ ] JWT_SECRET is strong and random (min 32 characters)
- [ ] MONGODB_URI uses secure authentication
- [ ] FRONTEND_URL is configured correctly
- [ ] No sensitive data in repository
- [ ] `.env` files are in `.gitignore`
- [ ] CORS is properly configured

## Troubleshooting Checklist

Before contacting support:

1. Check application logs in Railway Dashboard
2. Verify all environment variables are set
3. Test API endpoints manually using Postman
4. Verify MongoDB connection
5. Check frontend console for JavaScript errors

## Getting Help

1. Railway Docs: https://docs.railway.app
2. MongoDB Atlas Docs: https://docs.atlas.mongodb.com
3. Project Issues: Check your GitHub repository

## Next Steps

After successful deployment:

1. Set up continuous deployment from GitHub
2. Monitor application logs regularly
3. Plan for database backups
4. Set up error tracking (Sentry, etc.)
5. Configure alerts for errors and failures
