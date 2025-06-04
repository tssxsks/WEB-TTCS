import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDocumentById, downloadDocument } from '../api/documentApi';
import CommentSection from '../components/CommentSection';

const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await getDocumentById(id);
        setDocument(res.data);
      } catch (err) {
        setError('Không thể tải tài liệu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    if (document?._id) {
      downloadDocument(document._id);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Đang tải...</div>;
  }

  if (error) {
    return <div className="alert alert-danger py-5 text-center">{error}</div>;
  }

  if (!document) {
    return <div className="alert alert-warning py-5 text-center">Tài liệu không tồn tại.</div>;
  }

  return (
    <div className="container py-4">
      <h2>{document.title}</h2>
      <p><strong>Thể loại:</strong> {document.subject?.name || 'Không rõ'}</p>
      <p><strong>Mô tả:</strong> {document.description || 'Không có mô tả.'}</p>
      <p><strong>Người đăng:</strong> {document.nickname || 'Ẩn danh'} | <strong>Ngày đăng:</strong> {formatDate(document.createdAt)}</p>

      {/* Nút tải xuống */}
      <div className="mb-3">
        <button className="btn btn-success" onClick={handleDownload}>
          Tải xuống tài liệu
        </button>
      </div>

      {/* Xem trước tài liệu */}
      <div className="mb-4">
        <h5>Xem trước tài liệu</h5>
        {document.fileUrl ? (
          <iframe
            src={document.fileUrl}
            title="Xem tài liệu"
            width="100%"
            height="600px"
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          ></iframe>
        ) : (
          <div className="alert alert-secondary">
            Không có xem trước cho tài liệu này.
          </div>
        )}
      </div>

      {/* Bình luận */}
      <CommentSection documentId={document._id} />
    </div>
  );
};

export default DocumentDetail;
