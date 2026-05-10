import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <div className="header-left">
          <h2 className="logo" onClick={() => navigate('/dashboard')}>
            📋 TaskManager
          </h2>
        </div>

        <nav className="header-nav">
          <button
            className="nav-link"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="nav-link"
            onClick={() => navigate('/projects')}
          >
            Projects
          </button>
          <button
            className="nav-link"
            onClick={() => navigate('/tasks')}
          >
            Tasks
          </button>
          {user?.role === 'Admin' && (
            <button
              className="nav-link admin-link"
              onClick={() => navigate('/admin')}
            >
              ⚙️ Admin
            </button>
          )}
        </nav>

        <div className="header-right">
          <span className="user-info">
            {user?.name} ({user?.role})
          </span>
          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
