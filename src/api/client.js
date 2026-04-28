import axios from 'axios';

// For Android emulator use: http://10.0.2.2:8000/api
// For iOS simulator or physical device on same WiFi, use your machine's local IP:
// e.g. http://192.168.x.x:8000/api
// Backend runs on uvicorn default port 8000
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global interceptor for unhandled network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server is completely unreachable (e.g. backend down)
    if (!error.response && error.message === 'Network Error') {
      return Promise.reject({
        response: {
          data: {
            detail: 'Network Error: Cannot connect to the server. Please check your internet connection or try again later.'
          }
        }
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ---------- Auth ----------
export const authAPI = {
  login: (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    return apiClient.post('/auth/login', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  register: (name, username, email, password) =>
    apiClient.post('/auth/register', { name, username, email, password }),
  logout: () => apiClient.delete('/auth/logout'),
  refresh: () => apiClient.get('/auth/refresh'),
};

// ---------- Users ----------
export const usersAPI = {
  getMyProfile: () => apiClient.get('/users/profile'),
  getUserByUUID: (uuid) => apiClient.get(`/users/${uuid}`),
};

// ---------- Help Requests ----------
export const helpRequestsAPI = {
  paginate: ({ page = 1, size = 20, search = null, query = {}, sorting = {} } = {}) => {
    const formData = new FormData();
    formData.append('query', JSON.stringify(query));
    formData.append('sorting', JSON.stringify(sorting));
    let url = `/help_requests/paginate?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByUUID: (uuid) => apiClient.get(`/help_requests/${uuid}`),
  create: (title, description, location) =>
    apiClient.post('/help_requests', { title, description, location }),
  delete: (uuid) => apiClient.delete(`/help_requests/${uuid}`),
};

// ---------- Help Offers ----------
export const helpOffersAPI = {
  create: (help_request_uuid, message) =>
    apiClient.post('/help_offers', { help_request_uuid, message }),
  accept: (help_offer_uuid) =>
    apiClient.put(`/help_offers/${help_offer_uuid}/accept`),
};
