import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../api/documentApi';
import { getAllSubjects } from '../api/subjectApi';        // API để lấy danh sách Subjects
import { getAllDocumentLevels } from '../api/documentApi'; // API để lấy danh sách DocumentLevel
import { AuthContext } from '../context/AuthContext';

const UploadDocument = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    level: '',
    file: null
  });
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]); // state chứa danh sách document level
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Fetch subjects và document levels cùng lúc
    const fetchData = async () => {
      try {
        const [subjectsResponse, levelsResponse] = await Promise.all([
          getAllSubjects(),
          getAllDocumentLevels()
        ]);
        setSubjects(subjectsResponse.data);

        let levelsList = levelsResponse.data;
        // Lọc danh sách level dựa trên role của người dùng
        // Giả sử thuộc tính role của currentUser có dạng: { _id, role: 'admin' | 'teacher' | 'student', name, ... }
        if (currentUser?.role?.role === 'student') {
          // Sinh viên chỉ được chọn level 1 hoặc 3 (ví dụ)
          levelsList = levelsList.filter(lvl => lvl.level === 1 || lvl.level === 3);
        }
        //  else if (currentUser?.role?.role === 'teacher') {
        //   // Giảng viên có thể chọn các level 1, 2, 3 (hoặc thay đổi theo yêu cầu)
        //   levelsList = levelsList.filter(lvl => [1, 2, 3].includes(lvl.level));
        // }
        // Admin + Teacher : không lọc
        setLevels(levelsList);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('Kích thước file không được vượt quá 10MB');
      return;
    }

    setFormData({
      ...formData,
      file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fileError) return;
    if (!formData.file) {
      setFileError('Vui lòng chọn file tài liệu');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Gọi API upload document, formData bao gồm title, description, subject, level và file
      await uploadDocument(formData);
      navigate('/manage-documents');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lên tài liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2>Tải lên Tài liệu mới</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Tiêu đề */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Tiêu đề</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Mô tả */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Mô tả</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            {/* Thể loại */}
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Thể loại</label>
              <select
                className="form-select"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
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
            {/* Level tài liệu */}
            <div className="mb-3">
              <label htmlFor="level" className="form-label">Level Tài liệu</label>
              <select
                className="form-select"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn level tài liệu --</option>
                {levels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name} (Level {level.level})
                  </option>
                ))}
              </select>
            </div>
            {/* File tài liệu */}
            <div className="mb-3">
              <label htmlFor="file" className="form-label">File tài liệu</label>
              <input
                type="file"
                className={`form-control ${fileError ? 'is-invalid' : ''}`}
                id="file"
                onChange={handleFileChange}
                required
              />
              {fileError && <div className="invalid-feedback">{fileError}</div>}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang tải lên...' : 'Tải lên'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;