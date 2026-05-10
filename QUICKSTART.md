# Quick Start Guide - Team Task Manager

## ⚡ 5-Minute Setup

### Step 1: Backend Setup (2 minutes)

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_secret_key_123
JWT_EXPIRE=7d
NODE_ENV=development
```

Start MongoDB:
```bash
mongod
```

Start Backend (in a new terminal):
```bash
npm run dev
```

✅ Backend running on `http://localhost:5000`

### Step 2: Frontend Setup (2 minutes)

```bash
cd frontend
npm install
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start Frontend (in a new terminal):
```bash
npm start
```

✅ Frontend running on `http://localhost:3000`

### Step 3: Create Account (1 minute)

1. Go to `http://localhost:3000`
2. Click "Create one here" to sign up
3. Fill in your details and create account
4. You're logged in automatically!

## 🎮 Quick Demo Walkthrough

### 1. Create Your First Project
- Click "Projects" in the header
- Click "+ New Project"
- Fill in project details
- Click "Create Project"

### 2. Create a Task
- Click "Tasks" in the header
- Click "+ New Task"
- Select your project
- Fill in task details
- Click "Create Task"

### 3. Update Task Status
- Find your task in the Tasks list
- Change the status dropdown
- Task is updated instantly

### 4. View Dashboard
- Click "Dashboard" in the header
- See all your statistics
- Track overdue tasks and completions

## 📊 API Quick Reference

### Auth
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Projects
```bash
# Get all projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Test"}'
```

### Tasks
```bash
# Get all tasks
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","project":"PROJECT_ID","priority":"High"}'
```

## 🆘 Common Issues

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed

Make sure MongoDB is running:
```bash
# macOS
brew services start mongodb-community

# Windows
mongod
```

### CORS Error

Check if backend is running on port 5000 and frontend on port 3000.

### Token Expired

Just login again. Token lasts 7 days.

## 📱 User Roles

### Admin
- Manage all users
- Create/delete projects
- Add team members
- Full access to all tasks

### Member
- View assigned projects
- Create/update own tasks
- Add comments
- View team tasks

## 🎯 Feature Overview

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Complete |
| Project Management | ✅ Complete |
| Task Management | ✅ Complete |
| Role-Based Access | ✅ Complete |
| Dashboard Stats | ✅ Complete |
| Comments | ✅ Complete |
| Task Status Tracking | ✅ Complete |
| Task Filtering | ✅ Complete |
| User Management | ✅ Complete |
| Input Validation | ✅ Complete |

## 🔐 Test Credentials

After signup:
- Email: your_email@example.com
- Password: Your secure password
- Role: Member (change via admin panel)

## 📚 Key Files to Know

**Backend:**
- `server.js` - Main server entry
- `models/` - Database schemas
- `controllers/` - Business logic
- `routes/` - API endpoints
- `middleware/` - Auth, validation, errors

**Frontend:**
- `src/App.jsx` - Main React component
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/services/` - API calls
- `src/store/` - State management

## 🚀 Next Steps

1. Explore the Dashboard
2. Create a project and invite others
3. Create tasks and assign them
4. Track progress on the dashboard
5. Add comments and collaborate

## 💡 Pro Tips

- Use the filters on Tasks page to find specific tasks
- Check overdue tasks regularly on Dashboard
- Set task priorities for better organization
- Use comments for task discussions
- Update task status frequently

---

**Enjoy managing your tasks! 🎉**

Need help? Check the full README.md for detailed documentation.
