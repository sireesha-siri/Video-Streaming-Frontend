# Video Streaming Platform with Content Sensitivity Analysis

A comprehensive full-stack application for video upload, processing, and streaming with real-time content sensitivity analysis and granular access management.

## Features

**Core Functionality**
- JWT-based user authentication and authorization
- Role-Based Access Control (RBAC) with three roles: Viewer, Editor, and Admin
- Multi-tenant architecture with isolated data per organization
- Video upload supporting MP4, MPEG, MOV, AVI, and WEBM formats (max 500MB)
- Real-time processing updates via Socket.IO
- Automated content sensitivity analysis with safe/flagged classification
- HTTP range request support for efficient video streaming
- Responsive UI for desktop and mobile devices

**Video Access Management**
- Private videos visible only to owner by default
- Public videos accessible to all users within the same organization
- Granular sharing with specific users
- Real-time access indicators
- Organization-level data isolation

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- FFmpeg (for video processing)

## Installation

### Clone the Repository
```bash
git clone <repository-url>
cd video-streaming-app
```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-streaming
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start MongoDB and the backend server:
```bash
mongod
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Register/Login
Navigate to `http://localhost:5173/register`, create an account with your desired role (Viewer, Editor, or Admin), and login with your credentials.

### Upload Videos (Editor/Admin only)
Click "Upload" in the navigation, fill in video details (title, description), select a video file, and monitor real-time upload and processing progress.

### View Videos
Navigate to "Videos" to see all your uploaded videos. Use filters to find specific videos by status or sensitivity, and click "Watch" to play completed videos.

### Manage Video Access

**As Editor (Video Owner):** Upload a video and choose "Make public" during upload, or click the "🔐 Access" button on your video to toggle public access or share with specific users.

**As Admin:** Access any video in your organization, click "🔐 Access" to manage public access and user permissions, and view all users with access.

**As Viewer:** View public videos in your organization and videos explicitly shared with you. Viewers cannot upload or manage access.

### Admin Features
Access "Users" in the navigation to manage user roles, view user statistics, and delete users (except yourself).

## Architecture

### Backend
The backend uses Node.js with Express for the REST API server, MongoDB with Mongoose for the database and ODM, Socket.IO for real-time communication, Multer for file upload handling, FFmpeg for video metadata extraction, and JWT for authentication.

### Frontend
The frontend is built with React as the UI library, Vite as the build tool, Context API for state management, Axios as the HTTP client, and Socket.IO Client for real-time updates.

## Project Structure

```
video-streaming-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Video.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── video.js
│   │   └── user.js
│   ├── services/
│   │   └── videoProcessor.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   ├── Dashboard/
    │   │   ├── Video/
    │   │   ├── Admin/
    │   │   └── Layout/
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── VideoContext.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Videos
- `POST /api/videos/upload` - Upload video (Editor/Admin)
- `GET /api/videos` - Get all videos (filtered by user/org)
- `GET /api/videos/:id` - Get single video
- `GET /api/videos/:id/stream` - Stream video
- `DELETE /api/videos/:id` - Delete video (Editor/Admin)

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

## User Roles

**Viewer:** Can view assigned videos, stream videos, and has read-only access.

**Editor:** Has all Viewer permissions plus the ability to upload videos, manage own videos, delete own videos, and control access to their videos.

**Admin:** Has all Editor permissions plus the ability to view all videos in the organization, manage all users, update user roles, delete any user (except self), and manage access for any video.

## Video Processing Pipeline

The pipeline begins with upload where the user uploads a video file, followed by validation of file type and size. The video is then securely stored with a unique filename. During processing, metadata is extracted using FFmpeg and sensitivity analysis is performed to calculate a score from 0-100. Videos scoring below 70 are classified as Safe, while those at 70 or above are Flagged. Progress is sent via Socket.IO in real-time until the video is ready for streaming.

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (viewer/editor/admin),
  organization: String,
  createdAt: Date
}
```

### Video Schema
```javascript
{
  title: String,
  description: String,
  filename: String,
  originalName: String,
  filepath: String,
  fileSize: Number,
  mimeType: String,
  duration: Number,
  userId: ObjectId (ref: User),
  organization: String,
  status: String (uploading/processing/completed/failed),
  processingProgress: Number,
  sensitivityStatus: String (pending/safe/flagged),
  sensitivityScore: Number,
  sensitivityDetails: String,
  uploadedAt: Date,
  processedAt: Date
}
```

## Troubleshooting

**MongoDB Connection Issues:** Check if MongoDB is running with `mongod --version` and start it with `mongod`.

**FFmpeg Not Found:** Install FFmpeg using `sudo apt-get install ffmpeg` on Ubuntu/Debian, `brew install ffmpeg` on macOS, or download from ffmpeg.org for Windows.

**Port Already in Use:** Find and kill the process on port 5000 with `lsof -ti:5000 | xargs kill -9` or change the PORT in your .env file.

**CORS Issues:** Verify `FRONTEND_URL` in backend `.env` matches your frontend URL and check CORS configuration in `backend/server.js`.

**Video Upload Fails:** Check file size (max 500MB), verify supported formats, ensure the uploads directory has write permissions, and check available disk space.

**Real-time Updates Not Working:** Verify Socket.IO connection in browser console, check if the backend Socket.IO server is running, and verify firewall settings allow WebSocket connections.

## Quick Start Script

Create a file `setup.sh` in the root directory:
```bash
#!/bin/bash
echo "Setting up Video Streaming Platform..."
cd backend && npm install
cd ../frontend && npm install
echo "Setup Complete! Start MongoDB, then run backend and frontend with npm run dev"
```

Make it executable and run:
```bash
chmod +x setup.sh
./setup.sh
```

## Testing

### Test User Creation

```javascript
// 1. Admin user
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "organization": "TestOrg"
}

// 2. Editor user
{
  "name": "Editor User",
  "email": "editor@example.com",
  "password": "editor123",
  "role": "editor",
  "organization": "TestOrg"
}

// 3. Viewer user
{
  "name": "Viewer User",
  "email": "viewer@example.com",
  "password": "viewer123",
  "role": "viewer",
  "organization": "TestOrg"
}
```

### Testing Flow

**Registration & Login:** Register users with different roles, test login functionality, and verify JWT token generation.

**Video Upload:** Login as Editor/Admin, upload a sample video, monitor real-time progress updates, and verify processing completion.

**Video Streaming:** Navigate to a completed video, test video playback, and verify range request support.

**Role-Based Access:** Login as Viewer to verify no upload access, login as Editor to verify upload/manage own videos, and login as Admin to verify full access.

**Multi-Tenant:** Create users in different organizations and verify data isolation between organizations.

## Future Enhancements

Planned features include video transcoding for multiple quality levels, CDN integration for faster streaming, advanced search and filtering, video thumbnail generation, comments and ratings system, video analytics and statistics, batch video upload, video editing capabilities, integration with AI content moderation APIs, email notifications, video sharing and embedding, subtitle support, and live streaming capabilities.

## License

This project is licensed under the MIT License.

---

**Built for the Pulse Talent Interview Assignment**