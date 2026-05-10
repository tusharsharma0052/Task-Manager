const express = require('express');
const {
  signup,
  login,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  userValidationRules,
  validateRequest,
} = require('../middleware/validation');

const router = express.Router();

router.post('/signup', userValidationRules(), validateRequest, signup);
router.post('/login', login);

// Private routes
router.get('/me', authMiddleware, getMe);
router.get('/users', authMiddleware, roleMiddleware(['Admin']), getAllUsers);
router.put('/users/:id', authMiddleware, roleMiddleware(['Admin']), updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware(['Admin']), deleteUser);

module.exports = router;
