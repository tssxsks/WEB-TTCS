const User = require('../models/User');
const Document = require('../models/Document');
const Comment = require('../models/Comment');
const Role = require('../models/Role'); // Nếu cần dùng trong logic khác

// @desc    Lấy tất cả người dùng
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Nếu cần thông tin role đầy đủ, bạn có thể populate trường này
    const users = await User.find().populate('role');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Sửa người dùng (và xóa các Document liên quan nếu cần)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Tìm user cần cập nhật và populate trường role
    let user = await User.findById(req.params.id).populate('role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Không cho phép sửa tài khoản admin
    if (user.role && user.role.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không cho sửa người dùng này'
      });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      nickname: req.body.nickname || user.nickname,
      username: req.body.username || user.username,
    };

    // Xử lý cập nhật role:
    // Front-end gửi role ở dạng chuỗi: "student" hoặc "teacher"
    // Tìm Role tương ứng và lấy _id
    if (req.body.role) {
      const roleDoc = await Role.findOne({ role: req.body.role.toLowerCase() });
      if (!roleDoc) {
        return res.status(400).json({
          success: false,
          message: 'Role không hợp lệ'
        });
      }
      updateData.role = roleDoc._id;
    } else {
      // Nếu không có cập nhật role, giữ nguyên role hiện tại
      updateData.role = user.role._id;
    }

    // Xử lý cập nhật password nếu có
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    // Cập nhật user bằng findByIdAndUpdate (lưu ý: pre-save hook không chạy ở đây)
    user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: "Sửa thông tin người dùng thành công",
      data: user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Xóa người dùng (và xóa các Document, Comment liên quan)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Tìm người dùng theo id và populate role để có thể kiểm tra quyền
    const user = await User.findById(req.params.id).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép xóa tài khoản admin
    if (user.role && user.role.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản admin'
      });
    }

    // Xóa tất cả các Comment liên quan đến người dùng đó
    await Comment.deleteMany({ user: req.params.id });

    // Xóa tất cả các Document liên quan đến người dùng đó
    await Document.deleteMany({ user: req.params.id });

    // Xóa người dùng
    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};