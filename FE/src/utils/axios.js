import axios from "axios";
import { authService } from "@/utils/auth";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URI_API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor untuk menangani error 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url || '';
    if (error.response?.status === 401 && !requestUrl.includes('/user/login')) {
      // Token expired atau tidak valid
      authService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
