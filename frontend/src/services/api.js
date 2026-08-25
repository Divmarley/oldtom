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
  getCurrentUser: () => api.get('/auth/me/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

export const alumniService = {
  getAll: (search = '', config = {}) => {
    const normalizedSearch = String(search).trim();
    return api.get('/alumni/', {
      ...config,
      params: {
        ...(config.params ?? {}),
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
      },
    });
  },
  getById: (id) => api.get(`/alumni/${id}/`),
  create: (data) => api.post('/alumni/', data),
};

export const eventService = {
  getAll: () => api.get('/events/'),
  getById: (id) => api.get(`/events/${id}/`),
  getByName: async (identifier) => {
    const response = await api.get('/events/');
    const normalizedIdentifier = String(identifier || '').trim().toLowerCase();

    const event = response.data.find((item) => {
      const title = String(item.title || '').trim().toLowerCase();
      const eventName = String(item.name || '').trim().toLowerCase();
      return (
        String(item.id) === normalizedIdentifier ||
        title === normalizedIdentifier ||
        eventName === normalizedIdentifier ||
        title.includes(normalizedIdentifier) ||
        eventName.includes(normalizedIdentifier)
      );
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return { data: event };
  },
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
  create: (data) => api.post('/projects/', data),
};

export const donationService = {
  create: (data) => api.post('/donations/', data),
};

export const productService = {
  getAll: () => api.get('/products/'),
  getById: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
};

export const shippingService = {
  getAll: () => api.get('/shipping-options/'),
};

export const orderService = {
  create: (data) => api.post('/orders/', data),
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}/`),
};

export const blogService = {
  getAll: () => api.get('/blog/posts/'),
  getBySlug: (slug) => api.get(`/blog/posts/${slug}/`),
  create: (data) => api.post('/blog/posts/', data),
  update: (slug, data) => api.put(`/blog/posts/${slug}/`, data),
  delete: (slug) => api.delete(`/blog/posts/${slug}/`),
  likePost: (slug) => api.post(`/blog/posts/${slug}/like/`),
  getComments: (slug) => api.get(`/blog/posts/${slug}/comments/`),
  addComment: (data) => api.post('/blog/comments/', data),
};

export default api;
