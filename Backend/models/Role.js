const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Sinh viên', 'Giảng viên', 'Admin'],
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'teacher', 'admin'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', RoleSchema) ;