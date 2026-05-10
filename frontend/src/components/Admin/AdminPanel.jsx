import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ role: '', isActive: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('Member');

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive;

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const handleUpdateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setEditingUser(null);
      setNewRole('Member');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  // Load data on tab change
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab, page, filters]);

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          System Statistics
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-section">
          <h2>Dashboard Overview</h2>
          
          {loading ? (
            <div className="loading">Loading dashboard data...</div>
          ) : stats ? (
            <>
              {/* Quick Stats */}
              <div className="quick-stats-section">
                <div className="stats-row">
                  <div className="quick-stat-card">
                    <h3>Total Users</h3>
                    <p className="quick-stat-value">{stats.users.total}</p>
                    <p className="quick-stat-detail">{stats.users.active} active</p>
                  </div>
                  <div className="quick-stat-card">
                    <h3>Admins</h3>
                    <p className="quick-stat-value">{stats.users.admins}</p>
                    <p className="quick-stat-detail">{stats.users.members} members</p>
                  </div>
                  <div className="quick-stat-card">
                    <h3>Total Projects</h3>
                    <p className="quick-stat-value">{stats.projects.total}</p>
                  </div>
                  <div className="quick-stat-card">
                    <h3>Total Tasks</h3>
                    <p className="quick-stat-value">{stats.tasks.total}</p>
                    <p className="quick-stat-detail">{stats.tasks.completed} completed</p>
                  </div>
                </div>
              </div>

              {/* Task Status Cards */}
              <div className="task-status-section">
                <h3>Task Status Overview</h3>
                <div className="status-cards-row">
                  <div className="status-card in-progress">
                    <h4>In Progress</h4>
                    <p className="status-count">{stats.tasks.inProgress}</p>
                  </div>
                  <div className="status-card overdue">
                    <h4>Overdue</h4>
                    <p className="status-count">{stats.tasks.overdue}</p>
                  </div>
                  <div className="status-card completed">
                    <h4>Completed</h4>
                    <p className="status-count">{stats.tasks.completed}</p>
                  </div>
                  <div className="status-card completion-rate">
                    <h4>Completion Rate</h4>
                    <p className="status-count">{stats.tasks.completionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Most Active Projects */}
              <div className="dashboard-grid">
                <h3>Most Active Projects</h3>
                {stats.mostActiveProjects && stats.mostActiveProjects.length > 0 ? (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Tasks Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.mostActiveProjects.map((project) => (
                        <tr key={project._id}>
                          <td className="project-name">{project.name}</td>
                          <td className="task-count">{project.taskCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No projects with tasks</p>
                )}
              </div>

              {/* Top Contributors */}
              <div className="dashboard-grid">
                <h3>Top Contributors</h3>
                {stats.topContributors && stats.topContributors.length > 0 ? (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Tasks Assigned</th>
                        <th>Completed</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topContributors.map((contributor) => (
                        <tr key={contributor._id}>
                          <td className="contributor-name">{contributor.name}</td>
                          <td>{contributor.taskCount}</td>
                          <td>{contributor.completedCount}</td>
                          <td className="completion-percentage">{contributor.completionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No tasks assigned yet</p>
                )}
              </div>
            </>
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-section">
          <h2>User Management</h2>

          {/* Filters */}
          <div className="filters">
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters({ ...filters, role: e.target.value });
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>

            <select
              value={filters.isActive}
              onChange={(e) => {
                setFilters({ ...filters, isActive: e.target.value });
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : users.length > 0 ? (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {editingUser === user._id ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="role-select"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                          </select>
                        ) : (
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.isActive ? 'active' : 'inactive'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="actions">
                        {editingUser === user._id ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateRole(user._id, newRole)
                              }
                              className="btn-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="btn-cancel"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(user._id);
                                setNewRole(user.role);
                              }}
                              className="btn-edit"
                            >
                              Edit Role
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(user._id, user.isActive)
                              }
                              className={`btn-toggle ${
                                user.isActive ? 'deactivate' : 'activate'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-users">No users found</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-page"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-page"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="stats-section">
          <h2>System Statistics</h2>

          {loading ? (
            <div className="loading">Loading statistics...</div>
          ) : stats ? (
            <>
              {/* User Stats */}
              <div className="stats-grid">
                <h3>User Statistics</h3>
                <div className="stat-cards">
                  <div className="stat-card">
                    <h4>Total Users</h4>
                    <p className="stat-value">{stats.users.total}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Admins</h4>
                    <p className="stat-value">{stats.users.admins}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Members</h4>
                    <p className="stat-value">{stats.users.members}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Active Users</h4>
                    <p className="stat-value">{stats.users.active}</p>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="stats-grid">
                <h3>Project Statistics</h3>
                <div className="stat-cards">
                  <div className="stat-card">
                    <h4>Total Projects</h4>
                    <p className="stat-value">{stats.projects.total}</p>
                  </div>
                </div>
              </div>

              {/* Task Stats */}
              <div className="stats-grid">
                <h3>Task Statistics</h3>
                <div className="stat-cards">
                  <div className="stat-card">
                    <h4>Total Tasks</h4>
                    <p className="stat-value">{stats.tasks.total}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Completed</h4>
                    <p className="stat-value">{stats.tasks.completed}</p>
                  </div>
                  <div className="stat-card">
                    <h4>In Progress</h4>
                    <p className="stat-value">{stats.tasks.inProgress}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Overdue</h4>
                    <p className="stat-value" style={{ color: '#e74c3c' }}>
                      {stats.tasks.overdue}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h4>Completion Rate</h4>
                    <p className="stat-value">{stats.tasks.completionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Most Active Projects */}
              <div className="stats-grid">
                <h3>Most Active Projects</h3>
                {stats.mostActiveProjects && stats.mostActiveProjects.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.mostActiveProjects.map((project) => (
                        <tr key={project._id}>
                          <td>{project.name}</td>
                          <td>{project.taskCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
                    No projects with tasks yet
                  </p>
                )}
              </div>

              {/* Top Contributors */}
              <div className="stats-grid">
                <h3>Top Contributors</h3>
                {stats.topContributors && stats.topContributors.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Tasks</th>
                        <th>Completed</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topContributors.map((contributor) => (
                        <tr key={contributor._id}>
                          <td>{contributor.name}</td>
                          <td>{contributor.taskCount}</td>
                          <td>{contributor.completedCount}</td>
                          <td>{contributor.completionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
                    No assigned tasks yet
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="no-stats">No statistics available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
