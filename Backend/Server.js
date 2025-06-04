const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Nạp các biến môi trường
dotenv.config({ path: '.env' });

// Kết nối database
const connectDB = require('./config/db');
connectDB();

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(cors()); // Cho phép request từ các domain khác
app.use(express.json()); // Parsing JSON body

// Thiết lập đường dẫn tĩnh cho các file tải lên
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const subjectRoutes = require('./routes/subjects');
const statsRoutes = require('./routes/stats');
const feedbackRoutes = require('./routes/feedback');
const commentRoutes = require('./routes/comments');

// Khai báo routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/comments', commentRoutes);

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Xử lý lỗi upload file
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi tải file: ' + err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi máy chủ'
  });
});

// Cổng và khởi động server
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT, 
  console.log(`Server đang chạy trong chế độ ${process.env.NODE_ENV} trên cổng ${PORT}`)
);

// Xử lý lỗi không bắt được
process.on('unhandledRejection', (err, promise) => {
  console.log(`Lỗi: ${err.message}`);
  // Đóng server
  server.close(() => process.exit(1));
});

module.exports = app;
