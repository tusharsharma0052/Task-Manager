# RBAC Setup & Testing Guide

## Initial Setup

### 1. Create Admin User
When you first register a user, you can specify their role:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123456",
    "role": "Admin"
  }'
```

### 2. Create Member Users
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Member User",
    "email": "member@example.com",
    "password": "member123456",
    "role": "Member"
  }'
```

## Testing Different Roles

### Admin User Capabilities

#### 1. View All Users
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 2. View User Details
```bash
curl -X GET http://localhost:5000/api/admin/users/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 3. Update User Role
```bash
curl -X PUT http://localhost:5000/api/admin/users/<USER_ID>/role \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "role": "Admin" }'
```

#### 4. Deactivate User
```bash
curl -X PUT http://localhost:5000/api/admin/users/<USER_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "isActive": false }'
```

#### 5. Get System Statistics
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 6. View Activity Logs
```bash
curl -X GET http://localhost:5000/api/admin/activity-logs \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 7. Delete User
```bash
curl -X DELETE http://localhost:5000/api/admin/users/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Member User Capabilities

#### 1. Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <MEMBER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description",
    "dueDate": "2026-06-30",
    "priority": "High"
  }'
```

#### 2. Get My Projects
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer <MEMBER_TOKEN>"
```

#### 3. Get Project Details
```bash
curl -X GET http://localhost:5000/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <MEMBER_TOKEN>"
```

#### 4. Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <MEMBER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task title",
    "description": "Task description",
    "project": "<PROJECT_ID>",
    "assignee": "<ASSIGNEE_ID>",
    "dueDate": "2026-05-31",
    "priority": "High"
  }'
```

#### 5. Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/tasks/dashboard/stats \
  -H "Authorization: Bearer <MEMBER_TOKEN>"
```

## Permission Testing Scenarios

### Scenario 1: Admin Access Control
**Test**: Member tries to access admin endpoints
**Expected**: 403 Forbidden

```bash
# This should fail
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <MEMBER_TOKEN>"
```

### Scenario 2: Project Owner Control
**Test**: Non-owner tries to edit project
**Expected**: 403 Forbidden

```bash
# Member A creates project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <MEMBER_A_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "description": "Test"}'

# Member B tries to edit (should fail)
curl -X PUT http://localhost:5000/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <MEMBER_B_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Scenario 3: Task Assignment
**Test**: Only assignee can update task status
**Expected**: Success for assignee, 403 for others

```bash
# Assignee updates task
curl -X PUT http://localhost:5000/api/tasks/<TASK_ID> \
  -H "Authorization: Bearer <ASSIGNEE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'

# Non-assignee tries (should fail)
curl -X PUT http://localhost:5000/api/tasks/<TASK_ID> \
  -H "Authorization: Bearer <OTHER_MEMBER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

## Role Transition Testing

### Promote Member to Admin
```bash
# Get member ID from users list
curl -X GET "http://localhost:5000/api/admin/users" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Promote to Admin
curl -X PUT http://localhost:5000/api/admin/users/<MEMBER_ID>/role \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "role": "Admin" }'

# Now they can access admin endpoints
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <NOW_ADMIN_TOKEN>"
```

## Sample Test Cases

### Test Case 1: Admin Full Access
- ✓ Can view all users
- ✓ Can update user roles
- ✓ Can view system stats
- ✓ Can view activity logs
- ✓ Can manage all projects
- ✓ Can manage all tasks

### Test Case 2: Project Owner Access
- ✓ Can create projects
- ✓ Can edit own projects
- ✓ Can delete own projects
- ✓ Can add/remove members
- ✓ Cannot edit other's projects
- ✓ Cannot delete other's projects

### Test Case 3: Task Assignee Access
- ✓ Can view assigned tasks
- ✓ Can update task status
- ✓ Can add comments
- ✓ Cannot delete task (owner only)
- ✓ Cannot assign task to others

## Troubleshooting

### Issue: 401 Unauthorized
**Cause**: Invalid or missing token
**Solution**: Ensure token is included in Authorization header

```bash
# Correct format
-H "Authorization: Bearer <YOUR_TOKEN>"
```

### Issue: 403 Forbidden
**Cause**: User lacks required role or permissions
**Solution**: Check user role and resource ownership

### Issue: 404 Not Found
**Cause**: Resource doesn't exist or user can't access it
**Solution**: Verify resource ID and user permissions

## Security Notes

1. **Never expose admin tokens** in client-side code
2. **Always validate user role** on protected routes
3. **Check resource ownership** before allowing modifications
4. **Log all admin operations** for audit purposes
5. **Use HTTPS** in production for token transmission
6. **Rotate JWT secrets** regularly
7. **Set appropriate token expiration** (default: 24 hours)
