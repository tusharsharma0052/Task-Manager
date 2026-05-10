const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addMember,
  updateMemberRole,
  removeMember,
  deleteProject,
} = require('../controllers/projectController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  isProjectOwnerOrAdmin,
  isProjectMemberOrAdmin,
} = require('../middleware/rbac');
const {
  projectValidationRules,
  validateRequest,
} = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);

// Public project routes (all authenticated users)
router.post('/', projectValidationRules(), validateRequest, createProject);
router.get('/', getProjects);
router.get('/:id', isProjectMemberOrAdmin, getProjectById);

// Protected project routes (owner or admin only)
router.put(
  '/:id',
  isProjectOwnerOrAdmin,
  projectValidationRules(),
  validateRequest,
  updateProject
);
router.delete('/:id', isProjectOwnerOrAdmin, deleteProject);

// Member management (owner or admin only)
router.post('/:id/members', isProjectOwnerOrAdmin, addMember);
router.put('/:id/members/:memberId', isProjectOwnerOrAdmin, updateMemberRole);
router.delete('/:id/members/:memberId', isProjectOwnerOrAdmin, removeMember);

module.exports = router;
