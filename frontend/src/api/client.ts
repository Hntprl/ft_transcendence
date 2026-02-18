import axios from 'axios';

const baseURL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:3000';
console.log('API Client baseURL:', baseURL);

export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('API Request:', config.url, 'Headers:', config.headers);
  return config;
});
