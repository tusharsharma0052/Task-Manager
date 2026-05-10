import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { taskService, projectService } from '../services';
import { useTaskStore } from '../store';
import { formatDate, isOverdue, getStatusColor } from '../utils/helpers';
import './Tasks.css';

const Tasks = () => {
  const { tasks, setTasks, loading, setLoading } = useTaskStore();
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filterProject, filterStatus]);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterProject) params.project = filterProject;
      if (filterStatus) params.status = filterStatus;

      const response = await taskService.getAll(params);
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskService.create(formData);
      toast.success('Task created successfully');
      setFormData({
        title: '',
        description: '',
        project: '',
        priority: 'Medium',
        dueDate: '',
        estimatedHours: '',
      });
      setShowCreateForm(false);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      toast.success('Task updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(id);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const statuses = ['Todo', 'InProgress', 'InReview', 'Completed', 'Blocked'];

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="tasks container">
      <div className="tasks-header flex-between">
        <h1>Tasks</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-form card" onSubmit={handleSubmit}>
          <h3>Create New Task</h3>

          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task description"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Project</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Task
          </button>
        </form>
      )}

      <div className="filters card">
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`task-card card ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}
            >
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span className="priority-badge" style={{ backgroundColor: task.priority }}>
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                {task.dueDate && (
                  <span className={isOverdue(task.dueDate, task.status) ? 'overdue-label' : ''}>
                    📅 {formatDate(task.dueDate)}
                  </span>
                )}
                {task.estimatedHours && (
                  <span>⏱️ {task.estimatedHours}h estimated</span>
                )}
              </div>

              <div className="task-status">
                <label>Status:</label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="task-actions">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No tasks yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
