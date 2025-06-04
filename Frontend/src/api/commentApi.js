import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const commentAPI = axios.create({
  baseURL: `${API_URL}/comments`,
  headers: {
    'Content-Type': 'application/json'
  }
});

commentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if(token){
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  },
  (error) => Promise.reject(error)
);

// Lấy danh sách bình luận theo documentId
export const getComments = async (documentId) => {
  const response = await commentAPI.get(`/`, {
    params: { documentId }
  });
  return response.data;
};

// Thêm bình luận mới

export const createComment = async (commentData) => {
  const response = await commentAPI.post(`/`, commentData);
  return response.data;
}

// Cập nhật bình luận đã có (chỉ cập nhật nội dung)
export const updateComment = async (commentId, content) => {
  const response = await commentAPI.put(`/${commentId}`,{ content });
  return response.data;
};

// Xóa bình luận
export const deleteComment = async (commentId) => {
  const response = await commentAPI.delete(`/${commentId}`);
  return response.data;
};