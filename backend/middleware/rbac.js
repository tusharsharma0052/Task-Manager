/**
 * RBAC Middleware and Utilities
 * Manages role-based access control for Admin and Member roles
 */

// Check if user is Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }
  next();
};

// Check if user is project owner or Admin
const isProjectOwnerOrAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Admin or project owner can access
    if (req.user.role === 'Admin' || project.owner.toString() === req.user.id) {
      req.project = project;
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin or project owner can access this resource.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Check if user is project owner/admin or project member
const isProjectMemberOrAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Admin, owner, or member can access
    const isMember = project.members.some(
      (member) => member.toString() === req.user.id
    );
    const isOwner = project.owner.toString() === req.user.id;
    const isAdministrator = req.user.role === 'Admin';

    if (isMember || isOwner || isAdministrator) {
      req.project = project;
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Check if user is task assignee or admin or project owner
const isTaskAccessible = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const Project = require('../models/Project');

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(task.project);
    const isAssignee = task.assignee.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    const isOwner = project.owner.toString() === req.user.id;

    if (isAssignee || isAdmin || isOwner) {
      req.task = task;
      req.project = project;
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this task.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Permission checking functions
const permissions = {
  // Admin permissions
  admin: {
    viewAllUsers: (userRole) => userRole === 'Admin',
    manageUsers: (userRole) => userRole === 'Admin',
    viewAllProjects: (userRole) => userRole === 'Admin',
    manageProjectRoles: (userRole) => userRole === 'Admin',
    deleteProject: (userRole, project, userId) => 
      userRole === 'Admin' || project.owner.toString() === userId,
    viewSystemStats: (userRole) => userRole === 'Admin',
  },

  // Project permissions
  project: {
    createProject: (userRole) => true, // All users can create
    editProject: (userRole, project, userId) =>
      userRole === 'Admin' || project.owner.toString() === userId,
    deleteProject: (userRole, project, userId) =>
      userRole === 'Admin' || project.owner.toString() === userId,
    addMember: (userRole, project, userId) =>
      userRole === 'Admin' || project.owner.toString() === userId,
    removeMember: (userRole, project, userId) =>
      userRole === 'Admin' || project.owner.toString() === userId,
    changeRole: (userRole, project, userId) =>
      userRole === 'Admin' || project.owner.toString() === userId,
  },

  // Task permissions
  task: {
    createTask: (userRole, project, userId) => true, // Any project member
    editTask: (userRole, task, userId, project) =>
      userRole === 'Admin' || 
      task.assignee.toString() === userId || 
      project.owner.toString() === userId,
    deleteTask: (userRole, task, userId, project) =>
      userRole === 'Admin' || project.owner.toString() === userId,
    updateStatus: (userRole, task, userId) =>
      userRole === 'Admin' || task.assignee.toString() === userId,
    assignTask: (userRole, project, userId) =>
      userRole === 'Admin' || project.owner.toString() === userId,
  },
};

module.exports = {
  isAdmin,
  isProjectOwnerOrAdmin,
  isProjectMemberOrAdmin,
  isTaskAccessible,
  permissions,
};
