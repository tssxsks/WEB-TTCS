import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, updateUser } from '../api/userApi';
import { getAllDocuments } from '../api/documentApi';
import { AuthContext } from '../context/AuthContext';

const ManageUsers = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateFormData, setUpdateFormData] = useState({
    nickname: '',
    username: '',
    password: '',
    role: '', // Field role dưới dạng chuỗi ("student" hoặc "teacher")
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/');
      return;
    }
    
    const fetchUsersWithDocsCount = async () => {
      try {
        const response = await getAllUsers();
        // response.data được giả sử là mảng các user
        const usersData = response.data;
        
        // Tính số tài liệu cho mỗi user
        const usersWithDocCount = await Promise.all(
          usersData.map(async (user) => {
            try {
              const docsResponse = await getAllDocuments({ user: user._id });
              return { ...user, documentCount: docsResponse.data.length };
            } catch (docError) {
              console.error(`Error loading documents for user ${user._id}:`, docError);
              return { ...user, documentCount: 0 };
            }
          })
        );
        setUsers(usersWithDocCount);
      } catch (err) {
        setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithDocsCount();
  }, [currentUser, isAdmin, navigate]);

  // Mở form update và prefill dữ liệu của user được chọn
  const openUpdateForm = (user) => {
    setSelectedUser(user);
    setUpdateFormData({
      nickname: user.nickname,
      username: user.username,
      password: '', // Để trống nếu không muốn cập nhật password mới
      role: user.role?.role || '', // Lấy ra chuỗi role từ đối tượng role
    });
    setShowUpdateForm(true);
  };

  // Xử lý submit form cập nhật
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUser(selectedUser._id, updateFormData);
      // Sau khi cập nhật thành công, cập nhật lại state users để refresh bảng
      setUsers(users.map(user =>
        user._id === updatedUser._id ? updatedUser : user
      ));
      setShowUpdateForm(false);
    } catch (err) {
      setError('Không thể sửa người dùng, vui lòng thử lại sau.');
      console.error(err);
    }
  };

  // Xử lý xóa user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }
    
    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError('Không thể xóa người dùng. Vui lòng thử lại sau.');
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
      <h2>Quản lý Người dùng</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Nickname</th>
                  <th>Username</th>
                  <th>Vai trò</th>
                  <th>Ngày đăng ký</th>
                  <th>Tài liệu đã tải lên</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.nickname}</td>
                    <td>{user.username}</td>
                    <td>
                      <span className={`badge ${user.role?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role?.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>{user.documentCount || 0}</td>
                    <td>
                      {user.role?.role !== 'admin' && (
                        <>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => openUpdateForm(user)}>
                            Sửa
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user._id)}>
                            Xóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showUpdateForm && selectedUser && (
          <div className="mt-4">
            <h3>Cập nhật thông tin người dùng</h3>
            <form onSubmit={handleUpdateUserSubmit}>
              <div className="mb-3">
                <label htmlFor="nickname" className="form-label">Nickname</label>
                <input
                  type="text"
                  className="form-control"
                  id="nickname"
                  value={updateFormData.nickname}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, nickname: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={updateFormData.username}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, username: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={updateFormData.password}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, password: e.target.value })}
                />
              </div>
              {/* Box lựa chọn role */}
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  id="role"
                  className="form-select"
                  value={updateFormData.role}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, role: e.target.value.toLowerCase() })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Cập nhật</button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => setShowUpdateForm(false)}
              >
                Hủy
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;