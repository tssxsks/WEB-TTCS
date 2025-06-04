import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo instance axios với URL cơ sở
const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Hàm đăng ký
export const register = async (userData) => {
  const response = await authAPI.post('/register', userData, );
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Hàm đăng nhập
export const login = async (credentials) => {
  const response = await authAPI.post('/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Hàm đăng xuất
export const logout = async () => {
  const response = await authAPI.get('/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return response.data;
};

// Hàm lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const response = await authAPI.get('/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};