const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

const UserSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: [true, 'Vui lòng nhập nickname'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Vui lòng nhập username'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true, // Không đặt default vì cần gán bất đồng bộ
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-validate hook: Gán role mặc định nếu chưa có (trước khi chạy các validator)
UserSchema.pre('validate', async function (next) {
  if (!this.role) {
    try {
      const studentRole = await Role.findOne({ role: 'student' });
      if (studentRole) {
        this.role = studentRole._id;
      } else {
        throw new Error('Role student không tồn tại. Vui lòng tạo role student.');
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Pre-save hook: Hash mật khẩu nếu nó được sửa đổi
UserSchema.pre('save', async function (next) {
  // Nếu password chưa thay đổi, bỏ qua hash
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức ký JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Phương thức kiểm tra mật khẩu
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);