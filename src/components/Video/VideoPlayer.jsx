import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { videoAPI } from '../../services/api';
import VideoAccessManagement from './VideoAccessManagement';
import './Video.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getVideoById, fetchVideos } = useVideo();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    setLoading(true);
    const result = await getVideoById(id);
    
    if (result.success) {
      setVideo(result.video);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleAccessUpdate = (updatedVideo) => {
    setVideo(updatedVideo);
    setShowAccessModal(false);
    fetchVideos();
  };

  if (loading) {
    return (
      <div className="video-player-container">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="video-player-container">
        <div className="container">
          <div className="card">
            <div className="error-message">{error || 'Video not found'}</div>
            <button onClick={() => navigate('/videos')} className="btn btn-primary">
              Back to Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const streamUrl = videoAPI.getStreamUrl(video._id);
  const canManageAccess = user && (user.role === 'admin' || user.id === video.userId._id);
  const isOwner = user && user.id === video.userId._id;

  return (
    <div className="video-player-container">
      <div className="container">
        <div className="player-controls-header">
          <button onClick={() => navigate('/videos')} className="btn btn-secondary back-btn">
            ← Back to Videos
          </button>
          
          {canManageAccess && (
            <button
              onClick={() => setShowAccessModal(true)}
              className="btn btn-primary"
            >
               Manage Access
            </button>
          )}
        </div>

        <div className="player-card">
          <div className="player-wrapper">
            <video controls className="video-player">
              <source src={streamUrl} type={video.mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="player-info">
            <div className="player-title-row">
              <h1>{video.title}</h1>
              
              {/* NEW: Access status badges */}
              <div className="access-status">
                {video.isPublic ? (
                  <span className="access-badge-large public">
                     Public to Organization
                  </span>
                ) : (
                  <span className="access-badge-large private">
                     Private
                  </span>
                )}
              </div>
            </div>
            
            <div className="video-badges">
              <span className={`badge badge-${getStatusColor(video.status)}`}>
                {video.status}
              </span>
              {video.sensitivityStatus !== 'pending' && (
                <span
                  className={`badge badge-${getSensitivityColor(video.sensitivityStatus)}`}
                >
                  {video.sensitivityStatus}
                </span>
              )}
            </div>

            <p className="video-description">{video.description || 'No description'}</p>

            {/* NEW: Access Information */}
            {(isOwner || user.role === 'admin') && (
              <div className="access-info-section">
                <h3> Access Information</h3>
                <div className="access-details">
                  <div className="access-detail-item">
                    <strong>Visibility:</strong>{' '}
                    {video.isPublic ? (
                      <span className="text-success">
                        Public - All users in your organization can view
                      </span>
                    ) : (
                      <span className="text-muted">
                        Private - Only shared users can view
                      </span>
                    )}
                  </div>
                  
                  {video.sharedWith && video.sharedWith.length > 0 && (
                    <div className="access-detail-item">
                      <strong>Shared with:</strong>
                      <div className="shared-users-compact">
                        {video.sharedWith.map((u) => (
                          <span key={u._id} className="shared-user-chip">
                             {u.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!video.isPublic && (!video.sharedWith || video.sharedWith.length === 0) && (
                    <div className="access-detail-item">
                      <span className="text-warning">
                         This video is not shared with anyone yet
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="video-details">
              <div className="detail-item">
                <strong>Uploaded:</strong>{' '}
                {new Date(video.uploadedAt).toLocaleString()}
              </div>
              <div className="detail-item">
                <strong>Size:</strong> {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
              </div>
              {video.duration > 0 && (
                <div className="detail-item">
                  <strong>Duration:</strong> {formatDuration(video.duration)}
                </div>
              )}
              <div className="detail-item">
                <strong>Uploaded by:</strong> {video.userId?.name || 'Unknown'}
              </div>
            </div>

            {video.sensitivityDetails && (
              <div className="sensitivity-analysis">
                <h3>Content Analysis</h3>
                <p>{video.sensitivityDetails}</p>
                {video.sensitivityScore > 0 && (
                  <div className="sensitivity-score">
                    <strong>Sensitivity Score:</strong> {video.sensitivityScore}/100
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${video.sensitivityScore}%`,
                          background:
                            video.sensitivityScore < 70
                              ? '#28a745'
                              : video.sensitivityScore < 85
                              ? '#ffc107'
                              : '#dc3545',
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Access Management Modal */}
      {showAccessModal && (
        <VideoAccessManagement
          video={video}
          onClose={() => setShowAccessModal(false)}
          onUpdate={handleAccessUpdate}
        />
      )}
    </div>
  );
};

const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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

export default VideoPlayer;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useVideo } from '../../context/VideoContext';
// import { videoAPI } from '../../services/api';
// import './Video.css';

// const VideoPlayer = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { getVideoById } = useVideo();
//   const [video, setVideo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     loadVideo();
//   }, [id]);

//   const loadVideo = async () => {
//     setLoading(true);
//     const result = await getVideoById(id);
    
//     if (result.success) {
//       setVideo(result.video);
//     } else {
//       setError(result.error);
//     }
    
//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <div className="video-player-container">
//         <div className="container">
//           <div className="loading-container">
//             <div className="loading-spinner"></div>
//             <p>Loading video...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !video) {
//     return (
//       <div className="video-player-container">
//         <div className="container">
//           <div className="card">
//             <div className="error-message">{error || 'Video not found'}</div>
//             <button onClick={() => navigate('/videos')} className="btn btn-primary">
//               Back to Videos
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const streamUrl = videoAPI.getStreamUrl(video._id);

//   return (
//     <div className="video-player-container">
//       <div className="container">
//         <button onClick={() => navigate('/videos')} className="btn btn-secondary back-btn">
//           ← Back to Videos
//         </button>

//         <div className="player-card">
//           <div className="player-wrapper">
//             <video controls className="video-player">
//               <source src={streamUrl} type={video.mimeType} />
//               Your browser does not support the video tag.
//             </video>
//           </div>

//           <div className="player-info">
//             <h1>{video.title}</h1>
            
//             <div className="video-badges">
//               <span className={`badge badge-${getStatusColor(video.status)}`}>
//                 {video.status}
//               </span>
//               {video.sensitivityStatus !== 'pending' && (
//                 <span
//                   className={`badge badge-${getSensitivityColor(video.sensitivityStatus)}`}
//                 >
//                   {video.sensitivityStatus}
//                 </span>
//               )}
//             </div>

//             <p className="video-description">{video.description || 'No description'}</p>

//             <div className="video-details">
//               <div className="detail-item">
//                 <strong>Uploaded:</strong>{' '}
//                 {new Date(video.uploadedAt).toLocaleString()}
//               </div>
//               <div className="detail-item">
//                 <strong>Size:</strong> {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
//               </div>
//               {video.duration > 0 && (
//                 <div className="detail-item">
//                   <strong>Duration:</strong> {formatDuration(video.duration)}
//                 </div>
//               )}
//               <div className="detail-item">
//                 <strong>Uploaded by:</strong> {video.userId?.name || 'Unknown'}
//               </div>
//             </div>

//             {video.sensitivityDetails && (
//               <div className="sensitivity-analysis">
//                 <h3>Content Analysis</h3>
//                 <p>{video.sensitivityDetails}</p>
//                 {video.sensitivityScore > 0 && (
//                   <div className="sensitivity-score">
//                     <strong>Sensitivity Score:</strong> {video.sensitivityScore}/100
//                     <div className="score-bar">
//                       <div
//                         className="score-fill"
//                         style={{
//                           width: `${video.sensitivityScore}%`,
//                           background:
//                             video.sensitivityScore < 70
//                               ? '#28a745'
//                               : video.sensitivityScore < 85
//                               ? '#ffc107'
//                               : '#dc3545',
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const formatDuration = (seconds) => {
//   const hrs = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);

//   if (hrs > 0) {
//     return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   }
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// };

// const getStatusColor = (status) => {
//   switch (status) {
//     case 'completed':
//       return 'success';
//     case 'processing':
//       return 'info';
//     case 'failed':
//       return 'danger';
//     default:
//       return 'secondary';
//   }
// };

// const getSensitivityColor = (status) => {
//   switch (status) {
//     case 'safe':
//       return 'success';
//     case 'flagged':
//       return 'warning';
//     default:
//       return 'secondary';
//   }
// };

// export default VideoPlayer;