import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VideoProvider } from './context/VideoContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import VideoUpload from './components/Video/VideoUpload';
import VideoList from './components/Video/VideoList';
import VideoPlayer from './components/Video/VideoPlayer';
import UserManagement from './components/Admin/UserManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <VideoProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/upload" element={<VideoUpload />} />
                      <Route path="/videos" element={<VideoList />} />
                      <Route path="/video/:id" element={<VideoPlayer />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </VideoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;