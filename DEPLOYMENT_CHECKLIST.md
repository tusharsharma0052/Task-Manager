# Railway Deployment Checklist

## Pre-Deployment Preparation ✅

### 1. Code Preparation
- [ ] All code committed to GitHub
- [ ] `.env` files added to `.gitignore`
- [ ] No sensitive data in repository
- [ ] Latest versions of dependencies installed
- [ ] Application tested locally

### 2. Environment Variables Created
- [ ] Backend: MongoDB Atlas connection string ready
- [ ] Backend: Generate secure JWT_SECRET
- [ ] Backend: `.env.railway` file reviewed
- [ ] Frontend: `.env.railway` file reviewed

### 3. Database Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (free tier acceptable)
- [ ] Database user created
- [ ] Connection string copied
- [ ] IP whitelist configured (allow 0.0.0.0/0 for Railway)

### 4. Code Updates for Deployment
- [ ] ✅ Backend `server.js` - CORS configured dynamically
- [ ] ✅ Backend `server.js` - Listens on 0.0.0.0
- [ ] ✅ Frontend `api.js` - Uses `import.meta.env.VITE_API_URL`
- [ ] ✅ Frontend `.env` - Uses `VITE_API_URL`
- [ ] ✅ Both services have `Procfile` and `railway.toml`

## Deployment Steps

### Step 1: Create Railway Project
- [ ] Log in to [railway.app](https://railway.app)
- [ ] Create new project
- [ ] Connect GitHub account
- [ ] Select your repository

### Step 2: Deploy Backend Service
- [ ] Create new service from GitHub
- [ ] Select backend directory: `/backend`
- [ ] Add environment variables:
  - `MONGODB_URI` = MongoDB connection string
  - `JWT_SECRET` = Generated secure key (min 32 chars)
  - `JWT_EXPIRE` = `7d`
  - `NODE_ENV` = `production`
- [ ] Deployment completes successfully
- [ ] Note backend URL (e.g., `https://taskmanager-backend.railway.app`)

### Step 3: Deploy Frontend Service
- [ ] Create new service from GitHub
- [ ] Select frontend directory: `/frontend`
- [ ] Add environment variables:
  - `VITE_API_URL` = Backend URL from Step 2 (e.g., `https://taskmanager-backend.railway.app/api`)
- [ ] Deployment completes successfully
- [ ] Note frontend URL (e.g., `https://taskmanager-frontend.railway.app`)

### Step 4: Update Backend CORS
- [ ] Go back to backend service
- [ ] Update `FRONTEND_URL` environment variable with frontend URL from Step 3
- [ ] Trigger redeployment (push to GitHub or click redeploy)
- [ ] Verify deployment successful

## Post-Deployment Testing ✅

### 1. Frontend Accessibility
- [ ] Frontend URL opens in browser
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools

### 2. Authentication Flow
- [ ] Sign up as Admin user works
- [ ] Login works
- [ ] Token stored in localStorage
- [ ] Logout works

### 3. Admin Panel Access
- [ ] Admin user sees "⚙️ Admin" link
- [ ] Admin panel opens
- [ ] Dashboard displays with data
- [ ] User Management tab works
- [ ] System Statistics tab works

### 4. Project Management
- [ ] Create project works
- [ ] View projects works
- [ ] Update project works
- [ ] Delete project works

### 5. Task Management
- [ ] Create task works
- [ ] View tasks works
- [ ] Update task works
- [ ] Delete task works
- [ ] Change task status works

### 6. API Endpoint Testing (Optional)
Test these endpoints with Postman or curl:

**Health Check:**
```bash
curl https://your-backend.railway.app/health
```

**Auth Endpoints:**
```bash
# Signup
curl -X POST https://your-backend.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"Member"}'

# Login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Troubleshooting

### Issue: Frontend shows blank page
- [ ] Check browser console for JavaScript errors
- [ ] Verify `VITE_API_URL` in frontend environment variables
- [ ] Check Network tab for failed API requests
- [ ] Verify backend service is running

### Issue: API calls fail with CORS error
- [ ] Verify `FRONTEND_URL` is set in backend environment
- [ ] Check if frontend URL matches exactly (including protocol)
- [ ] Redeploy backend after updating `FRONTEND_URL`

### Issue: MongoDB connection fails
- [ ] Verify `MONGODB_URI` connection string is correct
- [ ] Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Test connection string locally first
- [ ] Check MongoDB user has correct permissions

### Issue: Authentication fails
- [ ] Verify `JWT_SECRET` is set in backend
- [ ] Check if token is being sent in Authorization header
- [ ] Verify token hasn't expired

### Issue: Admin panel shows no data
- [ ] Ensure you logged in as Admin user
- [ ] Check if you have any projects/tasks created
- [ ] Verify database has actual data

## Monitoring & Maintenance

### Regular Checks
- [ ] Monitor application logs in Railway Dashboard
- [ ] Check error rates and performance metrics
- [ ] Verify database connection is stable
- [ ] Monitor CPU and memory usage

### Monthly Tasks
- [ ] Review application logs for errors
- [ ] Check for available dependency updates
- [ ] Verify backup strategy for database
- [ ] Monitor Railway billing

### Security Maintenance
- [ ] Rotate JWT_SECRET periodically (requires code update)
- [ ] Keep dependencies updated
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs for suspicious activity

## Environment Variables Reference

### Backend Required
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/task-manager
JWT_SECRET=your_long_random_string_here_min_32_characters
JWT_EXPIRE=7d
NODE_ENV=production
PORT=3000 (optional, Railway assigns automatically)
FRONTEND_URL=https://your-frontend.railway.app
```

### Frontend Required
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Performance Optimization

### Frontend
- [x] Production build enabled
- [x] Build artifacts minified
- [x] Code splitting configured
- [ ] Consider enabling service worker for PWA
- [ ] Consider CDN for static assets

### Backend
- [x] Production-grade error handling
- [x] CORS properly configured
- [x] Database connection pooling via Mongoose
- [ ] Consider adding request caching
- [ ] Consider adding database query optimization

### Database
- [ ] Enable MongoDB indexes
- [ ] Configure appropriate replication
- [ ] Set up automated backups
- [ ] Monitor query performance

## Success Indicators

✅ All tests in Post-Deployment Testing pass
✅ No console errors in browser
✅ No error logs in Railway Dashboard
✅ API responds within acceptable time (< 1s)
✅ Database queries complete successfully
✅ Admin panel displays data correctly
✅ Users can complete full workflow (auth, projects, tasks, admin)

## Next Steps After Deployment

1. **Domain Setup** (Optional)
   - [ ] Purchase custom domain
   - [ ] Configure DNS to point to Railway
   - [ ] Set up SSL certificate

2. **Analytics** (Optional)
   - [ ] Set up error tracking (Sentry)
   - [ ] Configure performance monitoring
   - [ ] Set up user analytics

3. **CI/CD** (Optional)
   - [ ] Configure GitHub Actions for testing
   - [ ] Set up automatic deployments on push
   - [ ] Configure rollback procedures

4. **Documentation** (Optional)
   - [ ] Create user guide
   - [ ] Document API endpoints
   - [ ] Create admin guide

## Support & Resources

- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## Quick Links

- Frontend Repository: `c:\Users\tusha\OneDrive\Desktop\Task\frontend`
- Backend Repository: `c:\Users\tusha\OneDrive\Desktop\Task\backend`
- Deployment Guide: `RAILWAY_DEPLOYMENT.md`
- Environment Templates: `.env.railway` files in both directories

---

**Last Updated:** May 10, 2026
**Status:** Ready for Deployment ✅
