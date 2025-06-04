import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo instance axios với URL cơ sở cho stats
const statsAPI = axios.create({
  baseURL: `${API_URL}/stats`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động gắn token Authorization cho mỗi request
statsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàm lấy thống kê (admin only) với xử lý lỗi
export const getStats = async () => {
  try {
    const { data } = await statsAPI.get('/');
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    throw error;
  }
};

export default statsAPI;