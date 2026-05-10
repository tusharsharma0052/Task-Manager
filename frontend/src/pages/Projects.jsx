import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { projectService } from '../services';
import { useProjectStore } from '../store';
import { formatDate } from '../utils/helpers';
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate();
  const { projects, setProjects, loading, setLoading } = useProjectStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getAll();
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects');
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
      await projectService.create(formData);
      toast.success('Project created successfully');
      setFormData({ name: '', description: '', dueDate: '', priority: 'Medium' });
      setShowCreateForm(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        toast.success('Project deleted successfully');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="projects container">
      <div className="projects-header flex-between">
        <h1>Projects</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-form card" onSubmit={handleSubmit}>
          <h3>Create New Project</h3>

          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project description"
            ></textarea>
          </div>

          <div className="form-row">
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
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Project
          </button>
        </form>
      )}

      <div className="projects-list">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project._id} className="project-card card">
              <div className="project-header">
                <h3 onClick={() => navigate(`/projects/${project._id}`)} className="project-title">
                  {project.name}
                </h3>
                <span className={`badge badge-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="project-description">{project.description}</p>
              )}

              <div className="project-meta">
                <span>👤 {project.members.length} members</span>
                {project.dueDate && <span>📅 Due: {formatDate(project.dueDate)}</span>}
              </div>

              <div className="project-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  View Details
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(project._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No projects yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
