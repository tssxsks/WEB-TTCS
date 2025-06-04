import React from 'react';
import { useNavigate } from 'react-router-dom';

const DocumentCard = ({ document, onEdit, onDelete, showActions = false }) => {
  const navigate = useNavigate();

  // Định dạng ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Định dạng kích thước file
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleView = () => {
    navigate(`/documents/${document._id}`);
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{document.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">
          Thể loại: {document.subject?.name || 'Không xác định'}
        </h6>
        <p className="card-text">{document.description}</p>
        <div className="mb-2">
          <small className="text-muted">
            Đăng bởi: {document.nickname} | Ngày đăng: {formatDate(document.createdAt)}
          </small>
        </div>
        <div className="mb-2">
          <small className="text-muted">
            Kích thước: {formatFileSize(document.fileSize)} | Tải xuống: {document.downloadCount} lần
          </small>
        </div>
        <button 
          className="btn btn-primary me-2" 
          onClick={handleView}
        >
          Xem
        </button>

        {showActions && (
          <>
            <button 
              className="btn btn-warning me-2" 
              onClick={() => onEdit(document)}
            >
              Sửa
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => onDelete(document._id)}
            >
              Xóa
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
