import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const isDev = import.meta.env.DEV;

if (isDev) {
  console.log('Axios base URL:', API_BASE_URL);
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (isDev) {
      console.log('Axios request:', config.method?.toUpperCase(), config.url);
    }
    const token = localStorage.getItem('token');

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers?.setContentType === 'function') {
        config.headers.setContentType(undefined);
      }

      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }

    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log('Axios response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (isDev) {
      console.error('Axios error:', error.response?.status, error.config?.url);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
