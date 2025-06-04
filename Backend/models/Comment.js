// models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // tự động tạo trường createdAt và updatedAt
  }
);

module.exports = mongoose.model('Comment', CommentSchema);