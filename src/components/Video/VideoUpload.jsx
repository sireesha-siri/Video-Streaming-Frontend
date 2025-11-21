import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideo } from '../../context/VideoContext';
import './Video.css';

const VideoUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false, // NEW: Public access toggle
  });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const { uploadVideo } = useVideo();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid video file (MP4, MPEG, MOV, AVI, WEBM)');
        e.target.value = '';
        return;
      }

      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide a title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append('video', file);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('isPublic', formData.isPublic); // NEW: Add public flag

    const result = await uploadVideo(data, (progress) => {
      setUploadProgress(progress);
    });

    setUploading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setUploadProgress(0);
    }
  };

  return (
    <div className="video-upload-container">
      <div className="container">
        <div className="upload-card">
          <div className="upload-header">
            <h1> Upload Video</h1>
            <p>Share your content with the world</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="input-group">
              <label htmlFor="title">Video Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                required
                disabled={uploading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter video description (optional)"
                rows="4"
                disabled={uploading}
              />
            </div>

            {/* NEW: Public access checkbox */}
            <div className="input-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  disabled={uploading}
                />
                <span>
                  Make this video public to all users in my organization
                </span>
              </label>
              <small className="help-text">
                {formData.isPublic 
                  ? ' All users in your organization can view this video'
                  : 'ℹ Only you can view this video (you can share it with specific users later)'}
              </small>
            </div>

            <div className="input-group">
              <label htmlFor="video">Select Video File *</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="file-input"
                />
                {file && (
                  <div className="file-info">
                    <span> {file.name}</span>
                    <span className="file-size">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
              <small>Supported formats: MP4, MPEG, MOV, AVI, WEBM (Max: 500MB)</small>
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="progress-info">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={uploading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;


// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useVideo } from '../../context/VideoContext';
// import './Video.css';

// const VideoUpload = () => {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//   });
//   const [file, setFile] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   const { uploadVideo } = useVideo();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
    
//     if (selectedFile) {
//       // Validate file type
//       const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
//       if (!validTypes.includes(selectedFile.type)) {
//         setError('Please select a valid video file (MP4, MPEG, MOV, AVI, WEBM)');
//         e.target.value = '';
//         return;
//       }

//       // Validate file size (500MB max)
//       if (selectedFile.size > 500 * 1024 * 1024) {
//         setError('File size must be less than 500MB');
//         e.target.value = '';
//         return;
//       }

//       setFile(selectedFile);
//       setError('');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!file) {
//       setError('Please select a video file');
//       return;
//     }

//     if (!formData.title.trim()) {
//       setError('Please provide a title');
//       return;
//     }

//     setUploading(true);
//     setUploadProgress(0);

//     const data = new FormData();
//     data.append('video', file);
//     data.append('title', formData.title);
//     data.append('description', formData.description);

//     const result = await uploadVideo(data, (progress) => {
//       setUploadProgress(progress);
//     });

//     setUploading(false);

//     if (result.success) {
//       navigate('/dashboard');
//     } else {
//       setError(result.error);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="video-upload-container">
//       <div className="container">
//         <div className="upload-card">
//           <div className="upload-header">
//             <h1>📤 Upload Video</h1>
//             <p>Share your content with the world</p>
//           </div>

//           {error && <div className="error-message">{error}</div>}

//           <form onSubmit={handleSubmit} className="upload-form">
//             <div className="input-group">
//               <label htmlFor="title">Video Title *</label>
//               <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 placeholder="Enter video title"
//                 required
//                 disabled={uploading}
//               />
//             </div>

//             <div className="input-group">
//               <label htmlFor="description">Description</label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Enter video description (optional)"
//                 rows="4"
//                 disabled={uploading}
//               />
//             </div>

//             <div className="input-group">
//               <label htmlFor="video">Select Video File *</label>
//               <div className="file-input-wrapper">
//                 <input
//                   type="file"
//                   id="video"
//                   accept="video/*"
//                   onChange={handleFileChange}
//                   disabled={uploading}
//                   className="file-input"
//                 />
//                 {file && (
//                   <div className="file-info">
//                     <span>📹 {file.name}</span>
//                     <span className="file-size">
//                       {(file.size / (1024 * 1024)).toFixed(2)} MB
//                     </span>
//                   </div>
//                 )}
//               </div>
//               <small>Supported formats: MP4, MPEG, MOV, AVI, WEBM (Max: 500MB)</small>
//             </div>

//             {uploading && (
//               <div className="upload-progress">
//                 <div className="progress-info">
//                   <span>Uploading...</span>
//                   <span>{uploadProgress}%</span>
//                 </div>
//                 <div className="progress-bar">
//                   <div
//                     className="progress-bar-fill"
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
//               </div>
//             )}

//             <div className="form-actions">
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => navigate('/dashboard')}
//                 disabled={uploading}
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="btn btn-primary" disabled={uploading}>
//                 {uploading ? 'Uploading...' : 'Upload Video'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoUpload;