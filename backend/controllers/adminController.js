const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private - Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details (Admin only)
 * @access  Private - Admin
 */
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's projects
    const userProjects = await Project.find({
      $or: [{ owner: user._id }, { 'members.user': user._id }],
    });

    // Get user's tasks
    const userTasks = await Task.find({ assignee: user._id });

    res.status(200).json({
      success: true,
      user,
      stats: {
        projectsOwned: userProjects.filter(
          (p) => p.owner.toString() === user._id.toString()
        ).length,
        projectsParticipating: userProjects.length,
        tasksAssigned: userTasks.length,
        completedTasks: userTasks.filter((t) => t.status === 'Completed').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private - Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be Admin or Member',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Activate/deactivate user (Admin only)
 * @access  Private - Admin
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private - Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics (Admin only)
 * @access  Private - Admin
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const totalMembers = await User.countDocuments({ role: 'Member' });
    const activeUsers = await User.countDocuments({ isActive: true });

    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const inProgressTasks = await Task.countDocuments({
      status: 'In Progress',
    });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() },
    });

    // Most active projects
    const mostActiveProjects = await Project.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'project',
          as: 'tasks',
        },
      },
      {
        $addFields: {
          taskCount: { $size: '$tasks' },
        },
      },
      {
        $match: {
          taskCount: { $gt: 0 },
        },
      },
      { $sort: { taskCount: -1 } },
      { $limit: 5 },
      { $project: { name: 1, taskCount: 1 } },
    ]);

    // Top contributors
    const topContributors = await Task.aggregate([
      {
        $group: {
          _id: '$assignee',
          taskCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { taskCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          name: '$user.name',
          taskCount: 1,
          completedCount: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completedCount', '$taskCount'] }, 100] },
              2,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          members: totalMembers,
          active: activeUsers,
        },
        projects: {
          total: totalProjects,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks,
          completionRate: totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
        },
        mostActiveProjects,
        topContributors,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/audit-log
 * @desc    Get user activity logs (Admin only)
 * @access  Private - Admin
 */
exports.getActivityLogs = async (req, res, next) => {
  try {
    // Get recent project changes
    const recentProjects = await Project.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate('owner', 'name email')
      .select('name updatedAt createdAt owner');

    // Get recent tasks
    const recentTasks = await Task.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate('assignee', 'name email')
      .select('title status updatedAt createdAt assignee');

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('name email role createdAt isActive');

    res.status(200).json({
      success: true,
      activityLogs: {
        recentProjects,
        recentTasks,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
