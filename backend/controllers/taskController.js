const Task = require('../models/Task');
const Project = require('../models/Project');

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignee, priority, dueDate, estimatedHours, tags } = req.body;

    // Verify project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isMember =
      projectDoc.owner.toString() === req.user.id ||
      projectDoc.members.some((m) => m.user.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      createdBy: req.user.id,
      priority,
      dueDate,
      estimatedHours,
      tags,
    });

    await task.populate('assignee createdBy');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/tasks
// @desc    Get tasks (filtered by project or user)
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, status, assignee } = req.query;

    let filter = {};

    if (project) {
      // Check if user has access to project
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const isMember =
        projectDoc.owner.toString() === req.user.id ||
        projectDoc.members.some((m) => m.user.toString() === req.user.id);

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project',
        });
      }

      filter.project = project;
    }

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee createdBy project')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      'assignee createdBy project'
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const isMember =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check access
    const project = await Project.findById(task.project);
    const isMember =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task',
      });
    }

    const { title, description, assignee, status, priority, dueDate, estimatedHours, actualHours, tags } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (assignee !== undefined) task.assignee = assignee;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (tags) task.tags = tags;

    await task.save();
    await task.populate('assignee createdBy project');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/tasks/:id/checklist
// @desc    Update task checklist
// @access  Private
exports.updateChecklist = async (req, res, next) => {
  try {
    const { checklist } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.checklist = checklist;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Checklist updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.comments.push({
      user: req.user.id,
      text,
    });

    await task.save();
    await task.populate('comments.user');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/tasks/:id/comments/:commentId
// @desc    Delete comment from task
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const comment = task.comments.find(
      (c) => c._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is comment author
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    task.comments = task.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user is creator
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own tasks',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/dashboard
// @desc    Get dashboard stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get user's projects
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
    });

    const projectIds = projects.map((p) => p._id);

    // Get tasks assigned to user
    const assignedTasks = await Task.find({ assignee: req.user.id });

    // Get tasks created by user
    const createdTasks = await Task.find({ createdBy: req.user.id });

    // Count tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Count overdue tasks
    const overdueTasks = await Task.find({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'Completed' },
    });

    // Count completed tasks this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const completedThisMonth = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'Completed',
      updatedAt: { $gte: startOfMonth },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProjects: projects.length,
        totalTasks: assignedTasks.length + createdTasks.length,
        assignedTasks: assignedTasks.length,
        createdTasks: createdTasks.length,
        tasksByStatus,
        overdueTasks: overdueTasks.length,
        completedThisMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};
