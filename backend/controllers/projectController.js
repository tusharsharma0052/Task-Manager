const Project = require('../models/Project');
const User = require('../models/User');

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, dueDate, priority } = req.body;

    const project = await Project.create({
      name,
      description,
      dueDate,
      priority,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: 'Admin',
        },
      ],
    });

    await project.populate('owner members.user');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
    })
      .populate('owner')
      .populate('members.user')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner')
      .populate('members.user');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user has access
    const isMember =
      project.owner._id.toString() === req.user.id ||
      project.members.some((m) => m.user._id.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is owner or admin
    const userMember = project.members.find(
      (m) => m.user.toString() === req.user.id && m.role === 'Admin'
    );

    if (project.owner.toString() !== req.user.id && !userMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this project',
      });
    }

    const { name, description, dueDate, priority, status } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (dueDate) project.dueDate = dueDate;
    if (priority) project.priority = priority;
    if (status) project.status = status;

    await project.save();
    await project.populate('owner members.user');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private
exports.addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can add members',
      });
    }

    // Check if user already member
    const isMember = project.members.some(
      (m) => m.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    project.members.push({
      user: userId,
      role: role || 'Member',
    });

    await project.save();
    await project.populate('owner members.user');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/projects/:id/members/:memberId
// @desc    Update member role
// @access  Private
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can update member roles',
      });
    }

    const member = project.members.find(
      (m) => m._id.toString() === req.params.memberId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in project',
      });
    }

    member.role = role;
    await project.save();
    await project.populate('owner members.user');

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/projects/:id/members/:memberId
// @desc    Remove member from project
// @access  Private
exports.removeMember = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can remove members',
      });
    }

    project.members = project.members.filter(
      (m) => m._id.toString() !== req.params.memberId
    );

    await project.save();
    await project.populate('owner members.user');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete the project',
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
