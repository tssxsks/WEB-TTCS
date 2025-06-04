import React, { useState } from 'react';
import axios from 'axios';

const About = () => {
  const [feedback, setFeedback] = useState({
    fullname: '',
    email: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFeedback({
      ...feedback,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/feedback`, feedback);
      setSuccess('Cảm ơn bạn đã gửi feedback!');
      setFeedback({ fullname: '', email: '', content: '' });
    } catch (err) {
      setError('Không thể gửi feedback. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          <h2>Giới thiệu về Hệ thống Quản lý Tài liệu</h2>
          <p className="lead">
            Hệ thống Quản lý Tài liệu là nền tảng chia sẻ và lưu trữ tài liệu học tập,
            giúp người dùng dễ dàng tìm kiếm, tải xuống và quản lý tài liệu theo nhiều thể loại.
          </p>
          <p>
            Người dùng có thể đăng tải tài liệu của mình, quản lý các tài liệu đã đăng
            và tải xuống tài liệu từ những người dùng khác. Hệ thống phân loại tài liệu
            theo các chủ đề giúp việc tìm kiếm trở nên dễ dàng hơn.
          </p>
          <p>
            Đăng ký tài khoản ngay hôm nay để bắt đầu chia sẻ và truy cập kho tài liệu phong phú!
          </p>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Gửi Feedback</h5>
            </div>
            <div className="card-body">
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="fullname" className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullname"
                    name="fullname"
                    value={feedback.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={feedback.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Nội dung feedback</label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    rows="4"
                    value={feedback.content}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100" 
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi Feedback'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;