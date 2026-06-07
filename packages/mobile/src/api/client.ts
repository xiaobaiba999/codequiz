import axios from 'axios';
import { useAuthStore } from '../store/auth';

// 生产环境使用 Cloudflare Worker 代理地址，开发环境使用本地地址
const API_BASE = __DEV__
  ? 'http://10.0.2.2:3000/api' // Android 模拟器（iOS 用 localhost）
  : 'https://codequiz-proxy.2927609408.workers.dev/api'; // 生产环境

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { refreshToken, logout } = useAuthStore.getState();
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          useAuthStore.getState().setToken(res.data.data.accessToken);
          error.config.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return apiClient(error.config);
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
