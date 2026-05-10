const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateChecklist,
  addComment,
  deleteComment,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');
const { isTaskAccessible } = require('../middleware/rbac');
const {
  taskValidationRules,
  validateRequest,
} = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);

// Task CRUD operations
router.post('/', taskValidationRules(), validateRequest, createTask);
router.get('/', getTasks);
router.get('/dashboard/stats', getDashboardStats);
router.get('/:id', isTaskAccessible, getTaskById);
router.put('/:id', isTaskAccessible, taskValidationRules(), validateRequest, updateTask);
router.delete('/:id', isTaskAccessible, deleteTask);

// Checklist (only assignee or project owner can update)
router.put('/:id/checklist', isTaskAccessible, updateChecklist);

// Comments (accessible to assignee or project members)
router.post('/:id/comments', isTaskAccessible, addComment);
router.delete('/:id/comments/:commentId', isTaskAccessible, deleteComment);

module.exports = router;
