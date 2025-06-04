import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo instance axios với URL cơ sở cho document (BE được mount tại /api/documents)
const documentAPI = axios.create({
  baseURL: `${API_URL}/documents`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Gắn token Authorization cho mọi request thông qua interceptor
documentAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàm lấy danh sách DocumentLevels (endpoint: GET /api/documents/doclevels)
export const getAllDocumentLevels = async () => {
  const response = await documentAPI.get('/doclevels');
  return response.data;
};

// Hàm lấy tất cả Document (cho phép query qua params nếu cần)
// Endpoint: GET /api/documents
export const getAllDocuments = async (params = {}) => {
  const response = await documentAPI.get('/', { params });
  return response.data;
};

// Hàm lấy tài liệu theo ID
// Endpoint: GET /api/documents/:id
export const getDocumentById = async (id) => {
  const response = await documentAPI.get(`/${id}`);
  return response.data;
};

// Hàm tải lên tài liệu mới (với file upload nên dùng formData và ghi đè header Content-Type)
// Endpoint: POST /api/documents
export const uploadDocument = async (documentData) => {
  const formData = new FormData();
  formData.append('title', documentData.title);
  formData.append('description', documentData.description);
  formData.append('subject', documentData.subject);
  formData.append('level', documentData.level);
  formData.append('file', documentData.file);

  const response = await documentAPI.post(`/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: token ? `Bearer ${token}` : ''
    }
  });
  return response.data;
};

// Hàm cập nhật tài liệu
// Endpoint: PUT /api/documents/:id
export const updateDocument = async (id, documentData) => {
  const response = await documentAPI.put(`/${id}`, documentData);
  return response.data;
};

// Hàm xóa tài liệu
// Endpoint: DELETE /api/documents/:id
export const deleteDocument = async (id) => {
  const response = await documentAPI.delete(`/${id}`);
  return response.data;
};

// Hàm tải xuống tài liệu bằng cách mở cửa sổ mới
// Endpoint: GET /api/documents/:id/download
export const downloadDocument = (id) => {
  window.open(`${API_URL}/documents/${id}/download`, '_blank');
};

// Hàm lấy tài liệu của người dùng hiện tại
// Endpoint: GET /api/documents/my-documents
export const getMyDocuments = async () => {
  const response = await documentAPI.get('/my-documents');
  return response.data;
};