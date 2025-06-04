import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const userAPI = axios.create({
  baseURL: `${API_URL}/users`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Gắn token Authorization cho mọi request
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy tất cả người dùng
export const getAllUsers = async () => {
  const response = await userAPI.get('/');
  return response.data;
};

// Sửa người dùng
export const updateUser = async (userId, data) => {
  const response = await userAPI.put(`/${userId}`, data);
  return response.data;
}

// Xóa người dùng
export const deleteUser = async (userId) => {
  const response = await userAPI.delete(`/${userId}`);
  return response.data;
};
