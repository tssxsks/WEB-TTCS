// models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề tài liệu'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả tài liệu'],
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
  },
  // Thay vì lưu dưới dạng số, ta lưu kiểu ObjectId có tham chiếu đến model DocumentLevel
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentLevel',
    required: true
  },
  file: {
    type: String,
    required: [true, 'Vui lòng tải lên file tài liệu']
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);