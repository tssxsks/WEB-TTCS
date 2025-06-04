import React, { useState, useEffect } from 'react';
import { getAllDocuments } from '../api/documentApi'; // Giả sử hàm này trả về response.data từ axios
import { getAllSubjects } from '../api/subjectApi';
import DocumentCard from '../components/DocumentCard';

const Home = () => {
  const [documents, setDocuments] = useState([]); // Mảng tài liệu
  const [subjects, setSubjects] = useState([]); // Mảng thể loại
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    title: '',
    subject: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy tài liệu và thể loại đồng thời
        const [docsResponse, subjectsResponse] = await Promise.all([
          getAllDocuments(), // API trả về { success, count, pagination, data: [...] }
          getAllSubjects()
        ]);
        // Nếu API trả về tài liệu theo cấu trúc nested, set mảng là docsResponse.data
        setDocuments(docsResponse.data);
        setSubjects(subjectsResponse.data);
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gửi các params tìm kiếm (title và subject) qua query string
      const response = await getAllDocuments(searchParams);
      // Nếu API trả về tài liệu theo cấu trúc nested, gán mảng từ response.data
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

  return (
    <div className="container py-5">
      <h2>Tìm kiếm Tài liệu</h2>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-5">
                <label htmlFor="title" className="form-label">Tiêu đề</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={searchParams.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề tài liệu..."
                />
              </div>
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

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Home;