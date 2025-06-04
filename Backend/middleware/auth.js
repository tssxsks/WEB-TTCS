const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Bảo vệ routes: Kiểm tra token và phục hồi thông tin user (populate field role)
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Lấy token từ header
    token = req.headers.authorization.split(' ')[1];
  }

  // Kiểm tra xem token có tồn tại không
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user và populate trường role để đảm bảo role không chỉ là ObjectId
    req.user = await User.findById(decoded.id).populate('role');
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }
};

// Cấp quyền truy cập dựa trên vai trò: kiểm tra bằng thuộc tính cụ thể của object role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Nếu user.role là object đã được populate, lấy thuộc tính 'role'
    const userRole = req.user?.role && typeof req.user.role === 'object'
      ? req.user.role.role
      : req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${userRole} không được phép truy cập`
      });
    }
    next();
  };
};