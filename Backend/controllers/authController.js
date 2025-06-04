const User = require('../models/User');

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Lấy dữ liệu từ req.body
    const { nickname, username, password } = req.body;

    if (!nickname || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username đã tồn tại, vui lòng chọn username khác'
      });
    }

    // Tạo user mới (trường role sẽ được gán tự động qua pre-validate hook)
    const user = await User.create({ nickname, username, password });

    // Truy vấn lại user từ CSDL với populate đầy đủ
    const newUser = await User.findById(user._id).populate('role');

    // console.log("Đối tượng user sau khi findById và populate:", newUser);
    // console.log("Token test:", newUser.getSignedJwtToken());

    // Gửi token về cho người dùng
    sendTokenResponse(newUser, 201, res);

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }
    
    // Tìm user dựa trên username, kèm theo trường password (đã được select: false trong model)
    const user = await User.findOne({ username }).select('+password').populate('role');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }
    
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }
    
    sendTokenResponse(user, 200, res);
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Đăng xuất
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công'
  });
};

// Hàm gửi token về cho client
const sendTokenResponse = async (user, statusCode, res) => {

  // Tạo JWT từ method đã định nghĩa trong model User
  const token = user.getSignedJwtToken();

  // Lưu token trên cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      nickname: user.nickname,
      username: user.username,
      role: user.role  // Giờ đây, role đã được populate thành đối tượng, ví dụ: { _id, role: 'admin', name: 'Admin' }
    }
  });
};