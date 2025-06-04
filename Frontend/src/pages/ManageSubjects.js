import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjectApi';
import { getAllDocuments } from '../api/documentApi';
import { AuthContext } from '../context/AuthContext';

const ManageSubjects = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!currentUser || !isAdmin) {
      navigate('/');
      return;
    }

    const fetchSubjectsWithDocsCount = async () => {
      try {
        // Lấy danh sách thể loại và tài liệu đồng thời
        const [subjectsResponse, documentsResponse] = await Promise.all([
          getAllSubjects(),
          getAllDocuments()
        ]);

        const subjectsData = subjectsResponse.data;
        const documentsData = documentsResponse.data;

        // Tính số lượng tài liệu cho mỗi thể loại
        // Chúng ta so sánh bằng cách chuyển về chuỗi để đảm bảo đúng định dạng
        const subjectsWithCount = subjectsData.map((subject) => {
          const docCount = documentsData.filter((doc) => {
            if (doc.subject) {
              // Nếu doc.subject là một đối tượng (đã populate) hay chỉ là chuỗi ID
              const docSubjectId =
                typeof doc.subject === 'object' ? doc.subject._id : doc.subject;
              return docSubjectId.toString() === subject._id.toString();
            }
            return false;
          }).length;
          return { ...subject, documentCount: docCount };
        });

        setSubjects(subjectsWithCount);
        // Debug: console.log để kiểm tra lại dữ liệu
        console.log('Subjects with Count:', subjectsWithCount);
      } catch (err) {
        setError('Không thể tải danh sách thể loại. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectsWithDocsCount();
  }, [currentUser, isAdmin, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSubject) {
        // Cập nhật thể loại đã có
        const response = await updateSubject(editingSubject._id, formData);
        // Giữ nguyên documentCount của subject cũ
        setSubjects(
          subjects.map((subject) =>
            subject._id === editingSubject._id
              ? { ...response.data, documentCount: subject.documentCount }
              : subject
          )
        );
        setEditingSubject(null);
      } else {
        // Tạo thể loại mới
        const response = await createSubject(formData);
        // Thể loại mới chưa có tài liệu nên set documentCount = 0
        setSubjects([...subjects, { ...response.data, documentCount: 0 }]);
      }
      // Reset form
      setFormData({ name: '', description: '' });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Không thể lưu thể loại. Vui lòng thử lại sau.'
      );
      console.error(err);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      return;
    }

    try {
      await deleteSubject(id);
      setSubjects(subjects.filter((subject) => subject._id !== id));
    } catch (err) {
      setError('Không thể xóa thể loại. Vui lòng thử lại sau.');
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
    <div className="container py-5">
      <h2>{editingSubject ? 'Chỉnh sửa Thể loại' : 'Thêm Thể loại mới'}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Tên thể loại
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Mô tả
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="d-flex">
                  <button type="submit" className="btn btn-primary me-2">
                    {editingSubject ? 'Cập nhật' : 'Thêm mới'}
                  </button>

                  {editingSubject && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Danh sách Thể loại</h5>
            </div>
            <div className="card-body">
              {subjects.length === 0 ? (
                <div className="alert alert-info">
                  Chưa có thể loại nào. Hãy thêm thể loại mới.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Tên thể loại</th>
                        <th>Mô tả</th>
                        <th>Số tài liệu</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => (
                        <tr key={subject._id}>
                          <td>{subject.name}</td>
                          <td>{subject.description || '—'}</td>
                          <td>{subject.documentCount || 0}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEdit(subject)}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(subject._id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubjects;