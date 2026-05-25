/** @format */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

export const alumniService = {
  getAll: (search = '') => api.get(`/alumni/?search=${search}`),
  getById: (id) => api.get(`/alumni/${id}/`),
  create: (data) => api.post('/alumni/', data),
};

export const eventService = {
  getAll: () => api.get('/events/'),
  getById: (id) => api.get(`/events/${id}/`),
  create: (data) => api.post('/events/', data),
  update: (id, data) => api.put(`/events/${id}/`, data),
  delete: (id) => api.delete(`/events/${id}/`),
  register: (data) => api.post('/event-registration/', data),
};

export const contactService = {
  sendMessage: (data) => api.post('/contact/', data),
};

export const yearbookService = {
  getAll: () => api.get('/yearbook/'),
  create: (data) => api.post('/yearbook/', data),
};

export const projectService = {
  getAll: () => api.get('/projects/'),
  getById: (id) => api.get(`/projects/${id}/`),
  create: (data) =>
    api.post('/projects/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const donationService = {
  create: (data) => api.post('/donations/', data),
};

export const blogService = {
  getAll: () => api.get('/blog/posts/'),
  getBySlug: (slug) => api.get(`/blog/posts/${slug}/`),
  create: (data) =>
    api.post('/blog/posts/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (slug, data) =>
    api.put(`/blog/posts/${slug}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (slug) => api.delete(`/blog/posts/${slug}/`),
  likePost: (slug) => api.post(`/blog/posts/${slug}/like/`),
  getComments: (slug) => api.get(`/blog/posts/${slug}/comments/`),
  addComment: (data) => api.post('/blog/comments/', data),
};

export default api;
