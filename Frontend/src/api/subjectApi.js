import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const subjectAPI = axios.create({
  baseURL: `${API_URL}/subjects`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Gắn token Authorization cho mọi request
subjectAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy tất cả thể loại
export const getAllSubjects = async () => {
  const response = await subjectAPI.get('/');
  return response.data;
};

// Lấy thể loại theo ID
export const getSubjectById = async (id) => {
  const response = await subjectAPI.get(`/${id}`);
  return response.data;
};

// Tạo mới thể loại
export const createSubject = async (subjectData) => {
  const response = await subjectAPI.post('/', subjectData);
  return response.data;
};

// Cập nhật thể loại
export const updateSubject = async (id, subjectData) => {
  const response = await subjectAPI.put(`/${id}`, subjectData);
  return response.data;
};

// Xóa thể loại
export const deleteSubject = async (id) => {
  const response = await subjectAPI.delete(`/${id}`);
  return response.data;
};