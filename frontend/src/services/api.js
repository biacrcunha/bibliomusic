import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bibliomusic_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const ehRotaDeAuth = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !ehRotaDeAuth) {
      localStorage.removeItem('bibliomusic_token');
      localStorage.removeItem('bibliomusic_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);
export default api;
