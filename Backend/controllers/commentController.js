// controllers/commentController.js
const Comment = require('../models/Comment');

/**
 * Lấy danh sách bình luận theo documentId
 * Endpoint: GET /api/comments?documentId={documentId}
 */
exports.getComments = async (req, res) => {
  try {
    const { documentId } = req.query;
    if (!documentId) {
      return res.status(400).json({ message: "Thiếu thông tin tài liệu." });
    }
    // Truy vấn các bình luận và populate thông tin người dùng (chỉ lấy nickname)
    const comments = await Comment.find({ document: documentId })
      .populate('user', 'nickname')
      .sort({ createdAt: -1 });
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    return res.status(500).json({ message: "Lỗi khi lấy bình luận." });
  }
};

/**
 * Thêm một bình luận mới cho tài liệu
 * Endpoint: POST /api/comments
 * Yêu cầu body: { document, content }
 * Yêu cầu xác thực: Người dùng đã đăng nhập (req.user)
 */
exports.createComment = async (req, res) => {
  try {
    const { document, content } = req.body;
    if (!document || !content) {
      return res.status(400).json({ message: "Thông tin bình luận không hợp lệ." });
    }

    // Tạo bình luận với thông tin của người đăng nhập từ req.user
    const newComment = new Comment({
      document,
      content,
      user: req.user._id
    });
    await newComment.save();

    // Populate thông tin user (chỉ lấy nickname)
    await newComment.populate('user', 'nickname');
    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    return res.status(500).json({ message: "Lỗi khi thêm bình luận." });
  }
};

/**
 * Cập nhật nội dung của một bình luận
 * Endpoint: PUT /api/comments/:id
 * Chỉ cho phép chỉnh sửa bình luận mà chính người dùng đã đăng
 */
exports.updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Bình luận không tồn tại." });
    }

    // Kiểm tra quyền: chỉ có người đăng bình luận mới được chỉnh sửa
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bình luận này." });
    }

    comment.content = content;
    await comment.save();

    // Populate thông tin user (chỉ lấy nickname) trước khi trả về
    await comment.populate('user', 'nickname');
    return res.status(200).json(comment);
  } catch (error) {
    console.error("Lỗi khi cập nhật bình luận:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật bình luận." });
  }
};

/**
 * Xóa một bình luận
 * Endpoint: DELETE /api/comments/:id
 * Chỉ cho phép xóa bình luận mà chính người dùng đã đăng
 */
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Bình luận không tồn tại." });
    }

    // Kiểm tra quyền: chỉ cho phép người đăng bình luận mới được xóa
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này." });
    }

    await comment.deleteOne();
    return res.status(200).json({ message: "Xóa bình luận thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    return res.status(500).json({ message: "Lỗi khi xóa bình luận." });
  }
};