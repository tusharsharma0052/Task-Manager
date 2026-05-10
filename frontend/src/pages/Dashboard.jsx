import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { taskService } from '../services';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await taskService.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="dashboard container">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">{stats?.totalProjects || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats?.totalTasks || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Assigned To You</h3>
          <p className="stat-number">{stats?.assignedTasks || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Created By You</h3>
          <p className="stat-number">{stats?.createdTasks || 0}</p>
        </div>

        <div className="stat-card warning">
          <h3>Overdue Tasks</h3>
          <p className="stat-number">{stats?.overdueTasks || 0}</p>
        </div>

        <div className="stat-card success">
          <h3>Completed This Month</h3>
          <p className="stat-number">{stats?.completedThisMonth || 0}</p>
        </div>
      </div>

      <div className="mt-3">
        <h2>Task Status Overview</h2>
        <div className="status-breakdown">
          {stats?.tasksByStatus && stats.tasksByStatus.length > 0 ? (
            stats.tasksByStatus.map((item) => (
              <div key={item._id} className="status-item">
                <span>{item._id}:</span>
                <span className="status-count">{item.count}</span>
              </div>
            ))
          ) : (
            <p>No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
