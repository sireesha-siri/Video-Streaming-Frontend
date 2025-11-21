import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
             VideoStream
          </Link>

          <div className="navbar-links">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            <Link to="/videos" className={`nav-link ${isActive('/videos')}`}>
              Videos
            </Link>
            {user && (user.role === 'editor' || user.role === 'admin') && (
              <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>
                Upload
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
                Users
              </Link>
            )}
          </div>

          <div className="navbar-user">
            <span className="user-info">
               {user?.name}
              <span className="user-role">{user?.role}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;