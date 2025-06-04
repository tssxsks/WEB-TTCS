import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../api/statsApi';
import { getAllUsers } from '../api/userApi';
import { getAllDocuments } from '../api/documentApi';
import { AuthContext } from '../context/AuthContext';

// Giá trị mặc định cho stats, dùng khi API không trả về
const defaultStats = {
  users: { total: 0, lastWeek: 0 },
  documents: { total: 0, lastWeek: 0, bySubject: [] },
  subjects: { total: 0 },
  downloads: { total: 0, lastWeek: 0 },
  topUsers: []
};

const Statistics = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!currentUser || !isAdmin) {
      navigate('/');
      return;
    }
    
    const fetchStats = async () => {
      try {
        // Gọi API thống kê chung
        const response = await getStats();
        console.log('API trả về stats:', response);
        const fetched = response.data;
        
        // Đồng thời, tính topUsers theo số tài liệu đã tải lên thông qua getAllUsers và getAllDocuments
        const [usersResponse, documentsResponse] = await Promise.all([
          getAllUsers(),
          getAllDocuments()
        ]);
        const usersData = usersResponse.data;
        const documentsData = documentsResponse.data;

        // Với mỗi user, đếm số tài liệu có thuộc tính doc.user trùng với user._id
        const computedTopUsers = usersData.map((user) => {
          const docCount = documentsData.filter(
            (doc) => doc.user === user._id
          ).length;
          return { ...user, documentCount: docCount };
        });

        // Sắp xếp theo số tài liệu giảm dần, sau đó lấy top 5
        const sortedTopUsers = computedTopUsers
          .sort((a, b) => b.documentCount - a.documentCount)
          .slice(0, 5);
          
        // Cập nhật state stats với các giá trị từ API (hoặc mặc định) và topUsers tính được
        setStats({
          users: fetched.users !== undefined ? fetched.users : defaultStats.users,
          documents: fetched.documents !== undefined ? fetched.documents : defaultStats.documents,
          subjects: fetched.subjects !== undefined ? fetched.subjects : defaultStats.subjects,
          downloads: fetched.downloads !== undefined ? fetched.downloads : defaultStats.downloads,
          topUsers: sortedTopUsers
        });
      } catch (err) {
        setError('Không thể tải thống kê. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser, isAdmin, navigate]);

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
      <h2>Thống kê Hệ thống</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        {/* Thống kê người dùng */}
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Tổng số người dùng</h5>
              <h2 className="display-4">{stats.users.total}</h2>
              <p className="card-text">
                <small>+{stats.users.lastWeek} trong tuần qua</small>
              </p>
            </div>
          </div>
        </div>
        
        {/* Thống kê tài liệu */}
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Tổng số tài liệu</h5>
              <h2 className="display-4">{stats.documents.total}</h2>
              <p className="card-text">
                <small>+{stats.documents.lastWeek} trong tuần qua</small>
              </p>
            </div>
          </div>
        </div>
        
        {/* Thống kê thể loại */}
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Tổng số thể loại</h5>
              <h2 className="display-4">{stats.subjects.total}</h2>
            </div>
          </div>
        </div>
        
        {/* Thống kê lượt tải */}
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Lượt tải xuống</h5>
              <h2 className="display-4">{stats.downloads.total}</h2>
              <p className="card-text">
                <small>+{stats.downloads.lastWeek} trong tuần qua</small>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        {/* Tài liệu theo thể loại */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Tài liệu theo thể loại</h5>
            </div>
            <div className="card-body">
              {stats.documents.bySubject.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Thể loại</th>
                        <th>Số lượng tài liệu</th>
                        <th>Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.documents.bySubject.map((item, index) => (
                        <tr key={index}>
                          <td>{item.subject}</td>
                          <td>{item.count}</td>
                          <td>
                            <div className="progress">
                              <div 
                                className="progress-bar" 
                                role="progressbar"
                                style={{
                                  width: `${
                                    stats.documents.total > 0
                                      ? (item.count / stats.documents.total) * 100
                                      : 0
                                  }%`
                                }}
                                aria-valuenow={
                                  stats.documents.total > 0
                                    ? (item.count / stats.documents.total) * 100
                                    : 0
                                }
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              >
                                {stats.documents.total > 0
                                  ? ((item.count / stats.documents.total) * 100).toFixed(1)
                                  : 0}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  Chưa có dữ liệu thống kê theo thể loại.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Người dùng tích cực nhất */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Người dùng tích cực nhất</h5>
            </div>
            <div className="card-body">
              {stats.topUsers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Nickname</th>
                        <th>Tài liệu đã đăng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topUsers.map((user, index) => (
                        <tr key={index}>
                          <td>{user.nickname}</td>
                          <td>{user.documentCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  Chưa có dữ liệu thống kê người dùng tích cực.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;