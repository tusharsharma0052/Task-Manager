# Role-Based Access Control (RBAC) Documentation

## Overview

The Task Manager application implements a comprehensive Role-Based Access Control (RBAC) system with two primary roles:
- **Admin**: Full system access with administrative privileges
- **Member**: Standard user access with project-specific permissions

## User Roles

### Admin Role
- Full access to all users and projects
- Can view system statistics and activity logs
- Can manage user roles and status
- Can delete projects and users
- Can view all project members and tasks
- No restrictions on any operations

### Member Role
- Can create and manage their own projects
- Can invite members to their projects
- Can create tasks within their projects
- Can update tasks assigned to them
- Can view projects they own or are members of
- Limited to their assigned scope

## RBAC Middleware

### Auth Middleware (`middleware/auth.js`)
Verifies JWT token and extracts user information.

```javascript
const { authMiddleware } = require('./middleware/auth');
router.use(authMiddleware); // Require authentication
```

### Role Middleware (`middleware/auth.js`)
Checks if user has required roles.

```javascript
const { roleMiddleware } = require('./middleware/auth');
router.use(roleMiddleware(['Admin'])); // Only Admins
```

### Advanced RBAC Middleware (`middleware/rbac.js`)
Provides fine-grained access control:

#### `isAdmin`
Restricts access to Admin users only.

```javascript
router.delete('/users/:id', isAdmin, deleteUser);
```

#### `isProjectOwnerOrAdmin`
Allows access to project owner or Admin.

```javascript
router.put('/:id', isProjectOwnerOrAdmin, updateProject);
```

#### `isProjectMemberOrAdmin`
Allows access to project members or Admin.

```javascript
router.get('/:id', isProjectMemberOrAdmin, getProjectById);
```

#### `isTaskAccessible`
Allows access to task assignee, project owner, or Admin.

```javascript
router.put('/:id', isTaskAccessible, updateTask);
```

## API Endpoints by Role

### Public Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Authenticated Endpoints (All Members)
- `GET /api/auth/me` - Get current user profile
- `POST /api/projects` - Create a new project
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get project details (if member/owner)
- `POST /api/tasks` - Create a task
- `GET /api/tasks` - Get user's tasks
- `GET /api/tasks/dashboard/stats` - Get task statistics

### Protected Endpoints (Project Owner/Admin)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member
- `PUT /api/projects/:id/members/:memberId` - Update member role
- `DELETE /api/projects/:id/members/:memberId` - Remove member

### Protected Endpoints (Task Assignee/Project Owner/Admin)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/checklist` - Update task checklist
- `POST /api/tasks/:id/comments` - Add task comment
- `DELETE /api/tasks/:id/comments/:commentId` - Delete comment

### Admin-Only Endpoints
- `GET /api/admin/users` - Get all users (with pagination & filtering)
- `GET /api/admin/users/:id` - Get user details with stats
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/activity-logs` - Get activity audit logs

## Permission Matrix

| Operation | Admin | Project Owner | Project Member | Task Assignee |
|-----------|-------|---------------|----------------|---------------|
| View project | ✓ | ✓ | ✓ | ✓ |
| Edit project | ✓ | ✓ | ✗ | ✗ |
| Delete project | ✓ | ✓ | ✗ | ✗ |
| Add member | ✓ | ✓ | ✗ | ✗ |
| Remove member | ✓ | ✓ | ✗ | ✗ |
| Update member role | ✓ | ✓ | ✗ | ✗ |
| Create task | ✓ | ✓ | ✓ | N/A |
| View task | ✓ | ✓ | ✓ | ✓ |
| Edit task | ✓ | ✓ | ✗ | ✓ |
| Delete task | ✓ | ✓ | ✗ | ✗ |
| Update status | ✓ | ✓ | ✗ | ✓ |
| View all users | ✓ | ✗ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ | ✗ |
| View stats | ✓ | ✗ | ✗ | ✗ |

## Admin Features

### User Management
- View all users with pagination and filtering
- Search users by role or status
- Update user roles (Admin/Member)
- Activate/deactivate users
- Delete users

### System Statistics
- Total users count (by role and status)
- Total projects and tasks count
- Task completion rate
- Overdue task tracking
- Most active projects
- Top contributors with completion rates

### Activity Monitoring
- Recent project changes
- Recent task updates
- User registration logs
- System audit trail

## Usage Examples

### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Member"
  }'
```

### Admin Creating Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Planning",
    "description": "Q1 project planning",
    "dueDate": "2026-03-31",
    "priority": "High"
  }'
```

### Admin Viewing System Stats
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <admin_token>"
```

### Admin Updating User Role
```bash
curl -X PUT http://localhost:5000/api/admin/users/<userId>/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "role": "Admin" }'
```

## Error Responses

### Unauthorized (401)
Returned when no valid token is provided.
```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

### Forbidden (403)
Returned when user doesn't have required role/permission.
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### Not Found (404)
Returned when resource doesn't exist.
```json
{
  "success": false,
  "message": "Project not found"
}
```

## Security Considerations

1. **Token Validation**: All protected routes require valid JWT token
2. **Role Verification**: Each request verifies user role
3. **Resource Ownership**: Checks ensure users can only access their resources
4. **Admin Separation**: Admin routes are isolated and require explicit admin role
5. **Password Hashing**: Passwords are hashed using bcryptjs before storage
6. **Audit Logging**: All admin operations are logged for compliance

## Best Practices

1. Always verify `req.user` exists before using it
2. Check both role and resource ownership when needed
3. Return 403 Forbidden for permission issues, not 404
4. Log all admin operations for audit trails
5. Use specific role checks rather than just checking authentication
6. Test role transitions carefully
