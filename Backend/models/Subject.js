const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thể loại'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả cho thể loại'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', SubjectSchema);