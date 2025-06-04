const Subject = require('../models/Subject');
const Document = require('../models/Document');
const Comment = require('../models/Comment'); // Import model Comment

// @desc    Lấy tất cả thể loại
// @route   GET /api/subjects
// @access  Public
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort('name');
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy một thể loại
// @route   GET /api/subjects/:id
// @access  Public
exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Tạo thể loại mới
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cập nhật thể loại
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Xóa thể loại (và xóa tất cả Document và Comment liên quan)
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }
    
    // Tìm tất cả các Document liên quan đến thể loại này
    const docs = await Document.find({ subject: req.params.id }).select('_id');
    const docIds = docs.map(doc => doc._id);
    
    // Xóa tất cả Comment liên quan đến các Document đó
    await Comment.deleteMany({ document: { $in: docIds } });
    
    // Xóa các Document liên quan
    await Document.deleteMany({ subject: req.params.id });
    
    // Xóa thể loại
    await subject.deleteOne();

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