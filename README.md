# Team Task Manager - Full Stack Application

A comprehensive web application built with MERN stack for managing projects, tasks, and team collaboration with role-based access control.

## 🎯 Features

### Authentication & Authorization
- User signup and login with JWT
- Email-based authentication
- Role-based access control (Admin/Member)
- Secure password hashing with bcryptjs

### Project Management
- Create and manage projects
- Add/remove team members
- Assign roles to members (Admin/Member)
- Track project status (Active, OnHold, Completed, Archived)
- Set project priorities and due dates

### Task Management
- Create, update, and delete tasks
- Assign tasks to team members
- Track task status (Todo, InProgress, InReview, Completed, Blocked)
- Set priorities and estimated hours
- Add comments and attachments
- Checklist items for subtasks

### Dashboard
- Overview of projects and tasks
- Task statistics by status
- Overdue tasks tracking
- Monthly completion metrics
- Quick access to key metrics

## 📋 Project Structure

```
Team Task Manager/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   └── tokenUtils.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── SignUp.jsx
    │   │   ├── Header.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── Auth.css
    │   │   └── Header.css
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── Tasks.jsx
    │   │   ├── Dashboard.css
    │   │   ├── Projects.css
    │   │   └── Tasks.css
    │   ├── services/
    │   │   ├── api.js
    │   │   └── index.js
    │   ├── store/
    │   │   └── index.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── styles/
    │   │   ├── global.css
    │   │   └── components.css
    │   ├── App.jsx
    │   ├── index.js
    │   └── package.json
    └── .env
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Update .env with your configurations:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/team-task-manager
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. **Start MongoDB:**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas, update MONGODB_URI in .env

6. **Start the backend server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   Backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Update .env if needed:**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start the frontend development server:**
   ```bash
   npm start
   ```

   Frontend will open at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Project Endpoints

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "E-commerce Platform",
  "description": "New e-commerce website",
  "dueDate": "2024-12-31",
  "priority": "High"
}
```

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "Active"
}
```

#### Add Project Member
```http
POST /api/projects/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_here",
  "role": "Member"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Task Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design Homepage",
  "description": "Create beautiful homepage design",
  "project": "project_id_here",
  "assignee": "user_id_here",
  "priority": "High",
  "dueDate": "2024-06-30",
  "estimatedHours": 8
}
```

#### Get Tasks
```http
GET /api/tasks?project=project_id&status=InProgress
Authorization: Bearer <token>
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Completed",
  "actualHours": 7.5
}
```

#### Add Comment
```http
POST /api/tasks/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Task completed successfully"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### Dashboard Stats
```http
GET /api/tasks/dashboard/stats
Authorization: Bearer <token>
```

## 🔐 Role-Based Access Control

### Admin
- Full access to all projects and tasks
- Can manage all users
- Can add/remove project members
- Can delete projects and tasks

### Member
- Can view assigned projects and tasks
- Can update assigned tasks
- Can add comments to tasks
- Limited access based on project membership

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **react-toastify** - Notifications
- **date-fns** - Date utilities
- **CSS3** - Styling

## 📝 Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: enum ['Admin', 'Member'],
  avatar: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Schema
```javascript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  members: [{
    user: ObjectId (User),
    role: enum ['Admin', 'Member'],
    joinedAt: Date
  }],
  status: enum ['Active', 'OnHold', 'Completed', 'Archived'],
  startDate: Date,
  dueDate: Date,
  priority: enum ['Low', 'Medium', 'High', 'Critical'],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String,
  description: String,
  project: ObjectId (Project),
  assignee: ObjectId (User),
  createdBy: ObjectId (User),
  status: enum ['Todo', 'InProgress', 'InReview', 'Completed', 'Blocked'],
  priority: enum ['Low', 'Medium', 'High', 'Critical'],
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  checklist: [{
    item: String,
    completed: Boolean
  }],
  comments: [{
    user: ObjectId (User),
    text: String,
    createdAt: Date
  }],
  attachments: [{
    url: String,
    fileName: String,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the Application

### Sample Credentials
```
Email: test@example.com
Password: Test@123
Name: Test User
```

### Sample Workflow
1. Create an account (Signup)
2. Login with your credentials
3. Create a new project
4. Add team members to the project
5. Create tasks within the project
6. Assign tasks to team members
7. Update task status and track progress
8. View dashboard for project statistics

## 🚨 Error Handling

The application includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication/Authorization errors
- MongoDB connection errors
- JWT token verification errors
- Duplicate key errors
- 404 Not Found errors

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation using express-validator
- MongoDB injection prevention
- XSS protection through React's built-in escaping

## 📈 Performance Optimizations

- Database indexing on frequently queried fields
- Lazy loading of components
- Efficient state management with Zustand
- API response caching capabilities
- Pagination ready (can be added)

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity if using MongoDB Atlas

### CORS Errors
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL matches backend URL
- Verify CORS middleware is properly configured

### JWT Token Expired
- Token expires after 7 days
- User needs to login again
- Frontend automatically redirects to login on 401 errors

### Port Already in Use
```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📖 Future Enhancements

- File upload functionality
- Real-time notifications
- Project templates
- Task dependencies
- Time tracking
- Gantt chart visualization
- Email notifications
- Two-factor authentication
- Dark mode
- Mobile app (React Native)
- Docker containerization
- CI/CD pipeline

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Happy Task Managing! 🎉**
