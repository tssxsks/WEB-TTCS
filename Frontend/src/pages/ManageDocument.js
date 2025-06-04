import React, { useState, useEffect, useContext } from 'react';
import { getMyDocuments, updateDocument, deleteDocument } from '../api/documentApi';
import { getAllSubjects } from '../api/subjectApi';
import { getAllDocumentLevels } from '../api/documentApi'; // API fetch DocumentLevel
import { getAllDocuments } from '../api/documentApi';
import { AuthContext } from '../context/AuthContext';
import DocumentCard from '../components/DocumentCard';

const ManageDocument = () => {
  const { currentUser } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [docLevels, setDocLevels] = useState([]); // state cho DocumentLevel
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDocument, setEditingDocument] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    subject: '',
    level: '',
  });
  const [searchParams, setSearchParams] = useState({
    subject: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsResponse, subjectsResponse, levelsResponse] = await Promise.all([
          getMyDocuments(),
          getAllSubjects(),
          getAllDocumentLevels(),
        ]);
        setDocuments(docsResponse.data);
        setSubjects(subjectsResponse.data);

        let levels = levelsResponse.data;
        // Giả sử currentUser.role là chuỗi. Nếu currentUser.role là object, thay đổi logic cho phù hợp.
        if (currentUser?.role?.role === 'student') {
          // Sinh viên được phép chọn mức 1 hoặc 3
          levels = levels.filter(lvl => lvl.level === 1 || lvl.level === 3);
        } else if (currentUser?.role?.role === 'teacher') {
          // Giảng viên có thể chọn các mức 1,2,3 (hoặc tùy theo yêu cầu)
          levels = levels.filter(lvl => [1, 2, 3].includes(lvl.level));
        }
        // Admin: không hạn chế mức tài liệu
        setDocLevels(levels);
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await getAllDocuments(searchParams);
      setDocuments(response.data);
    } catch (err) {
      setError('Không thể tìm kiếm tài liệu. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleEdit = (document) => {
    setEditingDocument(document);
    setEditForm({
      title: document.title,
      description: document.description,
      subject: document.subject?._id || '',
      level: document.level || '', // document.level là ObjectId của DocumentLevel
    });
  };

  const handleEditCancel = () => {
    setEditingDocument(null);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();    
    try {
      const updatedDoc = await updateDocument(editingDocument._id, editForm);
      setDocuments(documents.map(doc => 
        doc._id === editingDocument._id ? updatedDoc.data : doc
      ));
      setEditingDocument(null);
    } catch (err) {
      setError('Không thể cập nhật tài liệu. Vui lòng thử lại sau.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return;
    }
    
    try {
      await deleteDocument(id);
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (err) {
      setError('Không thể xóa tài liệu. Vui lòng thử lại sau.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
  <>
    <div className="container py-5">
      <h2>Lọc tài liệu theo môn</h2>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row">
              <div className="col-md-5">
                <label htmlFor="subject" className="form-label">Thể loại</label>
                <select
                  className="form-select"
                  id="subject"
                  name="subject"
                  value={searchParams.subject}
                  onChange={handleInputChange}
                >
                  <option value="">Tất cả thể loại</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : 
      (
        <>
          <h3>Kết quả ({documents.length})</h3>
          {documents.length === 0 ? (
            <div className="alert alert-info">Không tìm thấy tài liệu nào.</div>
          ) : (
            documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))
          )}
        </>
      )
      } */}
    </div>

    <div className="container py-5">
      <h2>Quản lý Tài liệu của tôi</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {documents.length === 0 ? (
        <div className="alert alert-info">
          Bạn chưa tải lên tài liệu nào.
        </div>
      ) : (
        <div>
          {documents.map(document => (
            <div key={document._id}>
              {editingDocument && editingDocument._id === document._id ? (
                <div className="card mb-3">
                  <div className="card-header">
                    <h5 className="mb-0">Chỉnh sửa tài liệu</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleEditSubmit}>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">Tiêu đề</label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Mô tả</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          rows="3"
                          value={editForm.description}
                          onChange={handleEditChange}
                          required
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="subject" className="form-label">Thể loại</label>
                        <select
                          className="form-select"
                          id="subject"
                          name="subject"
                          value={editForm.subject}
                          onChange={handleEditChange}
                          required
                        >
                          <option value="">-- Chọn thể loại --</option>
                          {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="level" className="form-label">Mức tài liệu</label>
                        <select
                          className="form-select"
                          id="level"
                          name="level"
                          value={editForm.level}
                          onChange={handleEditChange}
                          required
                        >
                          <option value="">-- Chọn mức tài liệu --</option>
                          {docLevels.map(levelOption => (
                            <option key={levelOption._id} value={levelOption._id}>
                              {levelOption.name} (Level {levelOption.level})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <button type="submit" className="btn btn-success me-2">
                          Lưu thay đổi
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleEditCancel}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <DocumentCard
                  document={document}
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </>
);
}
export default ManageDocument;