// src/components/CommentSection.js
import React, { useState, useEffect, useContext } from 'react';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../api/commentApi';
import { AuthContext } from '../context/AuthContext';

const CommentSection = ({ documentId }) => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Debug: Log để kiểm tra currentUser
  console.log('Current User:', currentUser);

  // Lấy danh sách bình luận cho tài liệu có documentId
  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(documentId);
      setComments(data);
    } catch (err) {
      setError('Không thể tải bình luận.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  // Hàm thêm bình luận mới
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Kiểm tra user đã đăng nhập chưa
    if (!currentUser || !token) {
      setError('Bạn cần đăng nhập để bình luận.');
      return;
    }

    try {
      const commentData = { document: documentId, content: newComment };
      const addedComment = await createComment(commentData, token);
      setComments([addedComment, ...comments]);
      setNewComment('');
      setError(''); // Clear error nếu thành công
    } catch (err) {
      setError('Không thể thêm bình luận.');
      console.error(err);
    }
  };

  // Hàm cập nhật bình luận của chính user
  const handleUpdateComment = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateComment(editingCommentId, editingContent, token);
      setComments(
        comments.map((c) => (c._id === editingCommentId ? updated : c))
      );
      setEditingCommentId(null);
      setEditingContent('');
      setError(''); // Clear error nếu thành công
    } catch (err) {
      setError('Lỗi khi cập nhật bình luận.');
      console.error(err);
    }
  };

  // Hàm xóa bình luận của chính user
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }
    
    try {
      await deleteComment(commentId, token);
      setComments(comments.filter((c) => c._id !== commentId));
      setError(''); // Clear error nếu thành công
    } catch (err) {
      setError('Lỗi khi xóa bình luận.');
      console.error(err);
    }
  };

  if (authLoading) return <div>Đang kiểm tra quyền người dùng…</div>;

  return (
    <div className="mt-4">
      <h5>Bình luận</h5>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form thêm bình luận mới - chỉ hiện khi đã đăng nhập */}
      {currentUser ? (
        <form onSubmit={handleAddComment}>
          <div className="mb-3">
            <textarea
              className="form-control"
              placeholder="Nhập bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Gửi bình luận
          </button>
        </form>
      ) : (
        <div className="alert alert-info">
          Bạn cần đăng nhập để có thể bình luận.
        </div>
      )}

      <hr />

      {loading ? (
        <div>Đang tải bình luận...</div>
      ) : (
        <ul className="list-group">
          {comments.map((comment) => {
            // Debug: Log để kiểm tra từng comment
            console.log('Comment:', comment);
            console.log('Comment User:', comment.user);

            // Lấy ID của người comment (có thể là ObjectId hoặc populated object)
            let commentOwnerId = null;
            if (comment.user) {
              if (typeof comment.user === 'object' && comment.user._id) {
                // Trường hợp đã populate
                commentOwnerId = comment.user._id.toString();
              } else if (typeof comment.user === 'string') {
                // Trường hợp chỉ là ObjectId string
                commentOwnerId = comment.user.toString();
              }
            }

            // Lấy nickname để hiển thị
            const displayNickname =
              comment.user && typeof comment.user === 'object' && comment.user.nickname
                ? comment.user.nickname
                : 'Ẩn danh';

            // Lấy ID của user hiện tại
            let currentUserId = null;
            if (currentUser) {
              // Thử các trường có thể có
              currentUserId = currentUser._id || currentUser.id;
              if (currentUserId) {
                currentUserId = currentUserId.toString();
              }
            }

            // Kiểm tra quyền sở hữu comment
            const isOwner = currentUser && 
                           currentUserId && 
                           commentOwnerId && 
                           currentUserId === commentOwnerId;

            // Debug: Log để kiểm tra
            console.log('Current User ID:', currentUserId);
            console.log('Comment Owner ID:', commentOwnerId);
            console.log('Is Owner:', isOwner);

            return (
              <li key={comment._id} className="list-group-item">
                <div>
                  <strong>{displayNickname}</strong>{' '}
                  <small>{new Date(comment.createdAt).toLocaleString('vi-VN')}</small>
                </div>

                {editingCommentId === comment._id ? (
                  <form onSubmit={handleUpdateComment}>
                    <textarea
                      className="form-control"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      required
                    />
                    <div className="mt-2">
                      <button type="submit" className="btn btn-success btn-sm">
                        Lưu
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm ms-2"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent('');
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <p>{comment.content}</p>
                )}

                {/* Hiển thị nút sửa/xóa nếu user đã đăng nhập và là chủ comment */}
                {isOwner && editingCommentId !== comment._id && (
                  <div className="mt-2">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setEditingCommentId(comment._id);
                        setEditingContent(comment.content);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CommentSection;