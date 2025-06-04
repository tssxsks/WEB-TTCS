// routes/comments.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');  // Middleware bảo vệ route

// Lấy danh sách bình luận theo documentId, ví dụ: GET /api/comments?documentId=<document_id>
router.get('/', protect , commentController.getComments);

// Thêm bình luận (phải đăng nhập)
router.post('/', protect, commentController.createComment);

// Cập nhật bình luận (phải đăng nhập và chỉ có chủ của bình luận sửa được)
router.put('/:id', protect, commentController.updateComment);

// Xóa bình luận (phải đăng nhập và chỉ có chủ của bình luận xóa được)
router.delete('/:id', protect, commentController.deleteComment);

module.exports = router;