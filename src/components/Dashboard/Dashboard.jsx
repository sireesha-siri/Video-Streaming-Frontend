import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { Check, HardDriveUpload, Settings, ShieldCheck, TriangleAlert, Video,  } from "lucide-react";
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { videos, loading, uploadProgress } = useVideo();
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    safe: 0,
    flagged: 0,
  });

  useEffect(() => {
    if (videos) {
      const newStats = {
        total: videos.length,
        processing: videos.filter((v) => v.status === 'processing').length,
        completed: videos.filter((v) => v.status === 'completed').length,
        safe: videos.filter((v) => v.sensitivityStatus === 'safe').length,
        flagged: videos.filter((v) => v.sensitivityStatus === 'flagged').length,
      };
      setStats(newStats);
    }
  }, [videos]);

  const recentVideos = videos.slice(0, 5);

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Here's what's happening with your videos today</p>
          </div>
          {user && (user.role === 'editor' || user.role === 'admin') && (
            <Link to="/upload" className="btn btn-primary">
              <HardDriveUpload  size={15}/> Upload Video
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Video color='#662222' size={50}/></div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Videos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Settings color='#662222' size={50}/></div>
            <div className="stat-content">
              <h3>{stats.processing}</h3>
              <p>Processing</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Check color='#662222' size={50}/></div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><ShieldCheck color='#662222' size={50}/></div>
            <div className="stat-content">
              <h3>{stats.safe}</h3>
              <p>Safe Content</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon"><TriangleAlert color='#662222' size={50}/></div>
            <div className="stat-content">
              <h3>{stats.flagged}</h3>
              <p>Flagged Content</p>
            </div>
          </div>
        </div>

        {/* Processing Videos */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="card">
            <h2>Currently Processing</h2>
            {Object.entries(uploadProgress).map(([videoId, progress]) => (
              <div key={videoId} className="processing-item">
                <div className="processing-info">
                  <strong>Video Processing</strong>
                  <span>{progress.message}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progress.progress}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Videos */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Videos</h2>
            <Link to="/videos" className="view-all-link">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="loading-spinner"></div>
          ) : recentVideos.length > 0 ? (
            <div className="recent-videos">
              {recentVideos.map((video) => (
                <div key={video._id} className="recent-video-item">
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p>{video.description || 'No description'}</p>
                    <div className="video-meta">
                      <span className={`badge badge-${getStatusColor(video.status)}`}>
                        {video.status}
                      </span>
                      {video.sensitivityStatus !== 'pending' && (
                        <span
                          className={`badge badge-${getSensitivityColor(
                            video.sensitivityStatus
                          )}`}
                        >
                          {video.sensitivityStatus}
                        </span>
                      )}
                      <span className="video-date">
                        {new Date(video.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {video.status === 'completed' && (
                    <Link to={`/video/${video._id}`} className="btn btn-secondary">
                      Watch
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No videos yet. Start by uploading your first video!</p>
              {user && (user.role === 'editor' || user.role === 'admin') && (
                <Link to="/upload" className="btn button-style">
                  Upload Video
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'processing':
      return 'info';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getSensitivityColor = (status) => {
  switch (status) {
    case 'safe':
      return 'success';
    case 'flagged':
      return 'warning';
    default:
      return 'secondary';
  }
};

export default Dashboard;