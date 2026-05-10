const express = require('express');
const {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getSystemStats,
  getActivityLogs,
} = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['Admin']));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// System statistics and monitoring
router.get('/stats', getSystemStats);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
