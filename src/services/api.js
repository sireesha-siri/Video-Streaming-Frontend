import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://video-streaming-backend-2mg8.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Video APIs
export const videoAPI = {
  upload: (formData, onUploadProgress) => {
    return api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  getAll: (params) => api.get('/videos', { params }),
  getOne: (id) => api.get(`/videos/${id}`),
  delete: (id) => api.delete(`/videos/${id}`),
  getStreamUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/videos/${id}/stream?token=${token}`;
  },
  // NEW: Access management endpoints
  shareVideo: (id, userIds) => api.put(`/videos/${id}/share`, { userIds }),
  togglePublic: (id) => api.put(`/videos/${id}/toggle-public`),
  removeAccess: (videoId, userId) => api.delete(`/videos/${videoId}/share/${userId}`),
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;

// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Auth APIs
// export const authAPI = {
//   register: (data) => api.post('/auth/register', data),
//   login: (data) => api.post('/auth/login', data),
//   getMe: () => api.get('/auth/me'),
// };

// // Video APIs
// export const videoAPI = {
//   upload: (formData, onUploadProgress) => {
//     return api.post('/videos/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       onUploadProgress,
//     });
//   },
//   getAll: (params) => api.get('/videos', { params }),
//   getOne: (id) => api.get(`/videos/${id}`),
//   delete: (id) => api.delete(`/videos/${id}`),
//   getStreamUrl: (id) => {
//     const token = localStorage.getItem('token');
//     return `${API_URL}/videos/${id}/stream?token=${token}`;
//   },
// };

// // User APIs
// export const userAPI = {
//   getAll: () => api.get('/users'),
//   updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
//   delete: (id) => api.delete(`/users/${id}`),
// };

// export default api;