const Document = require('../models/Document');
const User = require('../models/User');
const Comment = require('../models/Comment');
const DocumentLevel = require('../models/DocumentLevel'); // Đổi tên từ DocLevel thành DocumentLevel
const path = require('path');
const fs = require('fs');

/*
  Helper function: Lấy danh sách ObjectId của DocumentLevel theo mảng số mong muốn.
  Ví dụ, nếu argument numbers = [1], sẽ trả về mảng các _id của các DocumentLevel có trường level = 1.
*/
async function getDocumentLevelIdsByNumbers(numbers) {
  const levels = await DocumentLevel.find({ level: { $in: numbers } });
  return levels.map(level => level._id);
}

// @desc    Lấy tất cả DocumentLevel
// @route   GET /api/documentlevels
// @access  Public
exports.getDocumentLevels = async (req, res) => {
  try {
    // Sắp xếp tăng dần theo trường `level`
    const levels = await DocumentLevel.find().sort({ level: 1 });
    res.status(200).json({
      success: true,
      data: levels
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Tải lên tài liệu mới
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
  try { 
    if (!req.file) { 
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên file tài liệu' });
    }

    // Kiểm tra file size (tối đa 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File không được vượt quá 10MB'
      });
    }

    // Lấy user và populate trường role
    const user = await User.findById(req.user.id).populate('role');

    // Nếu user là sinh viên, kiểm tra quyền upload theo DocumentLevel
    if (user.role && user.role.role === 'student') {
      if (req.body.level) {
        const documentLevel = await DocumentLevel.findById(req.body.level);
        if (!documentLevel) {
          return res.status(400).json({ success: false, message: 'Document level không hợp lệ' });
        }
        // Sinh viên chỉ được tải lên tài liệu có mức (level) bằng 1 hoặc 3
        if (documentLevel.level !== 1 && documentLevel.level !== 3) {
          return res.status(400).json({
            success: false,
            message: 'Sinh viên không được phép tải lên tài liệu với mức này'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin mức tài liệu'
        });
      }
    }

    // Tạo tài liệu mới. Lưu ý: field level được lưu là ObjectId trỏ tới DocumentLevel.
    const document = await Document.create({
      title: req.body.title,
      description: req.body.description,
      level: req.body.level, // ObjectId của DocumentLevel
      file: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      subject: req.body.subject,
      user: req.user.id,
      nickname: user.nickname
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Nếu có lỗi, xóa file vừa upload (nếu có)
    if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
      fs.unlink(`uploads/${req.file.filename}`, (err) => {
        if (err) console.error('Không thể xóa file:', err);
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cập nhật tài liệu
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }

    // Lấy thông tin user (với role) từ DB
    const user = await User.findById(req.user.id).populate('role');

    // Cho phép cập nhật nếu là chủ sở hữu hoặc admin
    if (document.user.toString() !== req.user.id && (!user.role || user.role.role !== 'admin')) {
      return res.status(401).json({
        success: false,
        message: 'Không được phép cập nhật tài liệu này'
      });
    }

    // Nếu user là sinh viên và có thay đổi level, cần kiểm tra lại DocumentLevel
    if (user.role && user.role.role === 'student' && req.body.level) {
      const documentLevel = await DocumentLevel.findById(req.body.level);
      if (!documentLevel) {
         return res.status(400).json({ success: false, message: 'Document level không hợp lệ' });
      }
      if(documentLevel.level !== 1 && documentLevel.level !== 3) {
         return res.status(400).json({
           success: false,
           message: 'Sinh viên không được phép cập nhật tài liệu với mức này'
         });
      }
    }

    const updateData = {
      title: req.body.title || document.title,
      description: req.body.description || document.description,
      level: req.body.level || document.level,
      subject: req.body.subject || document.subject
    };

    document = await Document.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Xóa tài liệu
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }

    const user = await User.findById(req.user.id).populate('role');

    // Cho phép xóa nếu là chủ sở hữu hoặc admin
    if (document.user.toString() !== req.user.id && (!user.role || user.role.role !== 'admin')) {
      return res.status(401).json({
        success: false,
        message: 'Không được phép xóa tài liệu này'
      });
    }

    // Xóa file từ thư mục uploads
    fs.unlink(`uploads/${document.file}`, (err) => {
      if (err) console.error('Không thể xóa file:', err);
    });

    // Xóa tất cả các Comment liên quan đến tài liệu này
    await Comment.deleteMany({ document: req.params.id });

    // Xóa tài liệu
    await document.deleteOne();

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

// @desc    Lấy tất cả tài liệu (bao gồm tìm kiếm theo tiêu đề và "subject" theo id)
// @route   GET /api/documents
// @access  Public
exports.getDocuments = async (req, res) => {
  try {
    // Sao chép req.query để không thay đổi req.query gốc
    const reqQuery = { ...req.query };

    // Loại bỏ các trường không cần dùng cho lọc (select, sort, page, limit)
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Xóa các key có giá trị rỗng
    Object.keys(reqQuery).forEach((key) => {
      if (reqQuery[key].trim() === '') {
        delete reqQuery[key];
      }
    });

    // Nếu có tìm kiếm theo tiêu đề, sử dụng regex không phân biệt chữ hoa thường
    if (reqQuery.title) {
      reqQuery.title = { $regex: reqQuery.title, $options: 'i' };
    }

    // Hỗ trợ các toán tử >, <, in,...
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Tạo đối tượng filter
    let filter = JSON.parse(queryStr);

    // Áp dụng phân quyền dựa trên vai trò của người dùng, nếu có
    if (req.user) {
      // Lấy thông tin user đầy đủ (với role)
      const currentUser = await User.findById(req.user.id).populate('role');
      let allowedConditions = [];
      if (currentUser.role && currentUser.role.role === 'student') {
        // Sinh viên: được xem tài liệu với DocumentLevel có level 1 chung
        // HOẶC tài liệu với DocumentLevel có level 3 mà chính mình đã đăng.
        const lvl1Ids = await getDocumentLevelIdsByNumbers([1]);
        const lvl3Ids = await getDocumentLevelIdsByNumbers([3]);
        allowedConditions = [
          { level: { $in: lvl1Ids } },
          { $and: [ { level: { $in: lvl3Ids } }, { user: req.user.id } ] }
        ];
      } else if (currentUser.role && currentUser.role.role === 'teacher') {
        // Giảng viên: được xem tài liệu với DocumentLevel có level 1 hoặc 2 chung
        // HOẶC tài liệu với DocumentLevel có level 3 mà chính mình đã đăng.
        const lvl12Ids = await getDocumentLevelIdsByNumbers([1, 2]);
        const lvl3Ids = await getDocumentLevelIdsByNumbers([3]);
        allowedConditions = [
          { level: { $in: lvl12Ids } },
          { $and: [ { level: { $in: lvl3Ids } }, { user: req.user.id } ] }
        ];
      }

      if (allowedConditions.length > 0) {
        // Kết hợp filter ban đầu với điều kiện $or cho các tài liệu được phép
        filter = { $and: [ filter, { $or: allowedConditions } ] };
      }
    }

    // Tìm tài liệu, sử dụng populate để lấy thông tin 'subject' (chỉ lấy trường "name")
    let query = Document.find(filter).populate('subject', 'name');

    // Nếu có chỉ định select fields (ví dụ: ?select=title,description)
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sắp xếp kết quả
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Phân trang
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Document.countDocuments(filter);

    query = query.skip(startIndex).limit(limit);

    // Thực thi query
    const documents = await query;

    // Xây dựng đối tượng pagination
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: documents.length,
      pagination,
      data: documents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy một tài liệu
// @route   GET /api/documents/:id
// @access  Public
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('subject', 'name');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Tải xuống tài liệu
// @route   GET /api/documents/:id/download
// @access  Public
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }

    // Xác định đường dẫn file
    const filePath = path.join(__dirname, '../uploads', document.file);
    const uploadsDir = path.join(__dirname, '../uploads');

    // Kiểm tra file có nằm trong thư mục uploads không (đảm bảo bảo mật)
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(400).json({
        success: false,
        message: 'File không hợp lệ'
      });
    }

    // Kiểm tra file có tồn tại hay không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File không tồn tại'
      });
    }

    // Tăng số lượt tải xuống
    document.downloadCount += 1;
    await document.save();

    res.download(filePath, document.file);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy tài liệu của người dùng hiện tại
// @route   GET /api/documents/my-documents
// @access  Private
exports.getMyDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    let documents;
    if (user.role && user.role.role === 'admin') {
      documents = await Document.find().populate('subject', 'name');
    } else { 
      documents = await Document.find({ user: req.user._id }).populate('subject', 'name');
    }
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};