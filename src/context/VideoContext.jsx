import React, { createContext, useState, useContext, useEffect } from 'react';
import { videoAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const VideoContext = createContext();

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchVideos();
      setupSocketListeners();
    }

    return () => {
      // Cleanup socket listeners
      socketService.off('videoProgress');
      socketService.off('videoError');
    };
  }, [user]);

  const setupSocketListeners = () => {
    // Listen for video processing updates
    socketService.on('videoProgress', (data) => {
      const { videoId, progress, status, sensitivityStatus, message } = data;
      
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video._id === videoId
            ? {
                ...video,
                status,
                processingProgress: progress,
                sensitivityStatus: sensitivityStatus || video.sensitivityStatus,
              }
            : video
        )
      );

      // Update upload progress for UI
      setUploadProgress((prev) => ({
        ...prev,
        [videoId]: { progress, message, status },
      }));

      // If completed, refresh the video list
      if (status === 'completed') {
        setTimeout(() => {
          fetchVideos();
        }, 1000);
      }
    });

    socketService.on('videoError', (data) => {
      const { videoId, message } = data;
      setError(message);
      
      setUploadProgress((prev) => ({
        ...prev,
        [videoId]: { progress: 0, message, status: 'failed' },
      }));
    });
  };

  const fetchVideos = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoAPI.getAll(filters);
      setVideos(response.data.videos);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (formData, onProgress) => {
    try {
      setError(null);
      
      const response = await videoAPI.upload(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      });

      const video = response.data.video;
      
      // Add to videos list
      setVideos((prev) => [video, ...prev]);

      // Trigger processing via socket
      socketService.emit('processVideo', {
        videoId: video.id,
        filepath: video.filepath,
      });

      return { success: true, video };
    } catch (err) {
      const message = err.response?.data?.message || 'Upload failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteVideo = async (id) => {
    try {
      setError(null);
      await videoAPI.delete(id);
      setVideos((prev) => prev.filter((video) => video._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Delete failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const getVideoById = async (id) => {
    try {
      setError(null);
      const response = await videoAPI.getOne(id);
      return { success: true, video: response.data.video };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch video';
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    videos,
    loading,
    error,
    uploadProgress,
    fetchVideos,
    uploadVideo,
    deleteVideo,
    getVideoById,
    setError,
  };

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
};