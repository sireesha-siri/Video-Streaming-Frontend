import React, { useState, useEffect } from 'react';
import { userAPI, videoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Video.css';

const VideoAccessManagement = ({ video, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user.role === 'admin') {
      fetchUsers();
    }
    
    if (video.sharedWith) {
      setSelectedUsers(video.sharedWith.map(u => u._id || u));
    }
  }, [video]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      // Filter out current user and video owner
      const filteredUsers = response.data.users.filter(
        u => u._id !== user.id && u._id !== video.userId._id
      );
      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleShareVideo = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await videoAPI.shareVideo(video._id, selectedUsers);
      
      setSuccess('Video access updated successfully');
      setTimeout(() => {
        onUpdate && onUpdate(response.data.video);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update video access');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await videoAPI.togglePublic(video._id);
      
      setSuccess(`Video is now ${response.data.video.isPublic ? 'public' : 'private'}`);
      setTimeout(() => {
        onUpdate && onUpdate(response.data.video);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle public access');
    } finally {
      setLoading(false);
    }
  };

  const canManageAccess = user.role === 'admin' || video.userId._id === user.id;

  if (!canManageAccess) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Access Denied</h2>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <p>You don't have permission to manage access for this video.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content access-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2> Manage Video Access</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="video-info-compact">
            <h3>{video.title}</h3>
            <p>Uploaded by: {video.userId.name}</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Public Access Toggle */}
          <div className="access-section">
            <h4>Public Access</h4>
            <div className="public-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={video.isPublic}
                  onChange={handleTogglePublic}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>
                {video.isPublic 
                  ? ' Public - All users in your organization can view'
                  : ' Private - Only shared users can view'}
              </span>
            </div>
          </div>

          {/* Share with Specific Users */}
          {user.role === 'admin' && (
            <div className="access-section">
              <h4>Share with Specific Users</h4>
              <p className="section-description">
                Select users who can view this video (even if it's private)
              </p>

              {users.length > 0 ? (
                <div className="users-list">
                  {users.map((u) => (
                    <label key={u._id} className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => handleUserToggle(u._id)}
                        disabled={loading}
                      />
                      <div className="user-info-item">
                        <div className="user-avatar-small">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{u.name}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                        <span className={`badge badge-${getRoleBadgeColor(u.role)}`}>
                          {u.role}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="no-users-message">No other users available to share with</p>
              )}

              {selectedUsers.length > 0 && (
                <div className="selected-count">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Currently Shared With */}
          {video.sharedWith && video.sharedWith.length > 0 && (
            <div className="access-section">
              <h4>Currently Shared With</h4>
              <div className="shared-users-list">
                {video.sharedWith.map((u) => (
                  <div key={u._id} className="shared-user-item">
                    <div className="user-avatar-small">
                      {u.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span>{u.name || 'Unknown User'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          {user.role === 'admin' && (
            <button
              onClick={handleShareVideo}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'editor':
      return 'info';
    case 'viewer':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export default VideoAccessManagement;