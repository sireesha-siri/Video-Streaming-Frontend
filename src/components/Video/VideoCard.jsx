import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVideo } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import VideoAccessManagement from './VideoAccessManagement';
import './Video.css';

const VideoCard = ({ video }) => {
  const { deleteVideo, fetchVideos } = useVideo();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setDeleting(true);
      await deleteVideo(video._id);
    }
  };

  const handleAccessUpdate = () => {
    setShowAccessModal(false);
    fetchVideos(); // Refresh video list
  };

  const canDelete = user && (user.role === 'admin' || user.id === video.userId._id);
  const canManageAccess = user && (user.role === 'admin' || user.id === video.userId._id);
  const isOwner = user && user.id === video.userId._id;

  return (
    <>
      <div className="video-card">
        <div className="video-card-header">
          <div className="video-thumbnail">
            {video.status === 'completed' ? (
              <div className="thumbnail-placeholder">🎬</div>
            ) : (
              <div className="thumbnail-placeholder">⏳</div>
            )}
          </div>
          
          {/* NEW: Access indicator badges */}
          <div className="access-indicators">
            {video.isPublic && (
              <span className="access-badge public" title="Public to organization">
                 Public
              </span>
            )}
            {!video.isPublic && video.sharedWith && video.sharedWith.length > 0 && (
              <span className="access-badge shared" title={`Shared with ${video.sharedWith.length} users`}>
                 Shared ({video.sharedWith.length})
              </span>
            )}
            {!video.isPublic && (!video.sharedWith || video.sharedWith.length === 0) && isOwner && (
              <span className="access-badge private" title="Private - Only you can view">
                 Private
              </span>
            )}
          </div>
        </div>

        <div className="video-card-body">
          <h3>{video.title}</h3>
          <p className="video-description">
            {video.description || 'No description provided'}
          </p>

          <div className="video-card-meta">
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

          {video.status === 'processing' && (
            <div className="video-processing">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${video.processingProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{video.processingProgress}%</span>
            </div>
          )}

          {video.sensitivityDetails && video.status === 'completed' && (
            <div className="sensitivity-details">
              <small>
                <strong>Analysis:</strong> {video.sensitivityDetails}
              </small>
            </div>
          )}

          <div className="video-info">
            <small>
               {new Date(video.uploadedAt).toLocaleDateString()} •{' '}
              {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
            </small>
            {video.userId && (
              <small> {video.userId.name}</small>
            )}
          </div>
        </div>

        <div className="video-card-footer">
          {video.status === 'completed' && (
            <Link to={`/video/${video._id}`} className="btn btn-primary btn-sm">
               Watch
            </Link>
          )}
          
          {/* NEW: Manage Access button */}
          {canManageAccess && (
            <button
              onClick={() => setShowAccessModal(true)}
              className="btn btn-secondary btn-sm"
              title="Manage who can view this video"
            >
               Access
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={handleDelete}
              className="btn btn-danger btn-sm"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : ' Delete'}
            </button>
          )}
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
    </>
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

export default VideoCard;

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useVideo } from '../../context/VideoContext';
// import { useAuth } from '../../context/AuthContext';
// import './Video.css';

// const VideoCard = ({ video }) => {
//   const { deleteVideo } = useVideo();
//   const { user } = useAuth();
//   const [deleting, setDeleting] = useState(false);

//   const handleDelete = async () => {
//     if (window.confirm('Are you sure you want to delete this video?')) {
//       setDeleting(true);
//       await deleteVideo(video._id);
//     }
//   };

//   const canDelete = user && (user.role === 'admin' || user.id === video.userId._id);

//   return (
//     <div className="video-card">
//       <div className="video-card-header">
//         <div className="video-thumbnail">
//           {video.status === 'completed' ? (
//             <div className="thumbnail-placeholder">🎬</div>
//           ) : (
//             <div className="thumbnail-placeholder">⏳</div>
//           )}
//         </div>
//       </div>

//       <div className="video-card-body">
//         <h3>{video.title}</h3>
//         <p className="video-description">
//           {video.description || 'No description provided'}
//         </p>

//         <div className="video-card-meta">
//           <span className={`badge badge-${getStatusColor(video.status)}`}>
//             {video.status}
//           </span>
//           {video.sensitivityStatus !== 'pending' && (
//             <span
//               className={`badge badge-${getSensitivityColor(video.sensitivityStatus)}`}
//             >
//               {video.sensitivityStatus}
//             </span>
//           )}
//         </div>

//         {video.status === 'processing' && (
//           <div className="video-processing">
//             <div className="progress-bar">
//               <div
//                 className="progress-bar-fill"
//                 style={{ width: `${video.processingProgress}%` }}
//               ></div>
//             </div>
//             <span className="progress-text">{video.processingProgress}%</span>
//           </div>
//         )}

//         {video.sensitivityDetails && video.status === 'completed' && (
//           <div className="sensitivity-details">
//             <small>
//               <strong>Analysis:</strong> {video.sensitivityDetails}
//             </small>
//           </div>
//         )}

//         <div className="video-info">
//           <small>
//              {new Date(video.uploadedAt).toLocaleDateString()} •{' '}
//             {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
//           </small>
//           {video.userId && (
//             <small> {video.userId.name}</small>
//           )}
//         </div>
//       </div>

//       <div className="video-card-footer">
//         {video.status === 'completed' && (
//           <Link to={`/video/${video._id}`} className="btn btn-primary btn-sm">
//              Watch
//           </Link>
//         )}
//         {canDelete && (
//           <button
//             onClick={handleDelete}
//             className="btn btn-danger btn-sm"
//             disabled={deleting}
//           >
//             {deleting ? 'Deleting...' : ' Delete'}
//           </button>
//         )}
//       </div>
//     </div>
//   );
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

// export default VideoCard;