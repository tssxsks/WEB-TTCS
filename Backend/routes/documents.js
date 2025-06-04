const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getDocumentLevels,   // Lấy danh sách DocumentLevel
  uploadDocument, 
  updateDocument, 
  deleteDocument, 
  getDocuments, 
  getDocument, 
  downloadDocument,
  getMyDocuments
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`);
  }
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Định dạng file không được hỗ trợ!'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
});

const router = express.Router();

router.route('/doclevels').get(protect, getDocumentLevels);

// Các endpoint cho Document
router
  .route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);

router
  .route('/my-documents')
  .get(protect, getMyDocuments);

router
  .route('/:id')
  .get(protect, getDocument)
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

router
  .route('/:id/download')
  .get(downloadDocument);

module.exports = router;