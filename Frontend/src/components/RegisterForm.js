import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nickname: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(formData);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="nickname" className="form-label">Nickname</label>
        <input
          type="text"
          className="form-control"
          id="nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          required
        />
        <div className="form-text">
          Nickname sẽ được hiển thị khi bạn đăng tải tài liệu hoặc bình luận.
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="username" className="form-label">Username</label>
        <input
          type="text"
          className="form-control"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
        <div className="form-text">
          Mật khẩu phải có ít nhất 6 ký tự.
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <button 
        type="submit" 
        className="btn btn-primary w-100" 
        disabled={loading}
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>
    </form>
  );
};

export default RegisterForm;