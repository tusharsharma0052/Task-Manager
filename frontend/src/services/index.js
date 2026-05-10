import api from './api';

// Auth Services
export const authService = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
  updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Project Services
export const projectService = {
  create: (projectData) => api.post('/projects', projectData),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, memberData) => api.post(`/projects/${id}/members`, memberData),
  updateMemberRole: (id, memberId, roleData) =>
    api.put(`/projects/${id}/members/${memberId}`, roleData),
  removeMember: (id, memberId) =>
    api.delete(`/projects/${id}/members/${memberId}`),
};

// Task Services
export const taskService = {
  create: (taskData) => api.post('/tasks', taskData),
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateChecklist: (id, checklist) => api.put(`/tasks/${id}/checklist`, { checklist }),
  addComment: (id, comment) => api.post(`/tasks/${id}/comments`, { text: comment }),
  deleteComment: (id, commentId) => api.delete(`/tasks/${id}/comments/${commentId}`),
  getDashboardStats: () => api.get('/tasks/dashboard/stats'),
};
