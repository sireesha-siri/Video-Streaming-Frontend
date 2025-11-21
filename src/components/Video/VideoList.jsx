import React, { useState, useEffect } from 'react';
import { useVideo } from '../../context/VideoContext';
import VideoCard from './VideoCard';
import './Video.css';

const VideoList = () => {
  const { videos, loading, fetchVideos } = useVideo();
  const [filters, setFilters] = useState({
    status: '',
    sensitivityStatus: '',
  });

  useEffect(() => {
    fetchVideos(filters);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      sensitivityStatus: '',
    });
  };

  return (
    <div className="video-list-container">
      <div className="container">
        <div className="video-list-header">
          <h1>📹 Video Library</h1>
          <p>Manage and view all your uploaded videos</p>
        </div>

        {/* Filters */}
        <div className="card filters-card">
          <h3>Filters</h3>
          <div className="filters-grid">
            <div className="input-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="uploading">Uploading</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="sensitivityStatus">Content Safety</label>
              <select
                id="sensitivityStatus"
                name="sensitivityStatus"
                value={filters.sensitivityStatus}
                onChange={handleFilterChange}
              >
                <option value="">All Content</option>
                <option value="safe">Safe</option>
                <option value="flagged">Flagged</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading videos...</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <h2>No videos found</h2>
            <p>Try adjusting your filters or upload a new video</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoList;