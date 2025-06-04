const User = require('../models/User');
const Document = require('../models/Document');
const Subject = require('../models/Subject');

// @desc    Lấy thống kê
// @route   GET /api/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    // Đếm số lượng người dùng, tài liệu và thể loại
    const userCount = await User.countDocuments();
    const documentCount = await Document.countDocuments();
    const subjectCount = await Subject.countDocuments();

    // Tính thống kê tài liệu theo thể loại
    const topSubjectsAgg = await Document.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Sử dụng Document.populate và chỉ định model để đảm bảo việc populate hoạt động đúng
    const populatedTopSubjects = await Document.populate(topSubjectsAgg, {
      path: '_id',
      model: 'Subject',
      select: 'name'
    });

    const formattedTopSubjects = populatedTopSubjects.map(item => ({
      subject: item._id && item._id.name ? item._id.name : 'Không xác định',
      count: item.count
    }));

    // Tính tổng số downloads của tất cả tài liệu (giả sử Document có trường downloadCount)
    const downloadsAgg = await Document.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);
    const totalDownloads = downloadsAgg.length > 0 ? downloadsAgg[0].totalDownloads : 0;

    // Trả về danh sách người dùng tích cực nhất (hiện tại để mảng rỗng)
    const topUsers = [];

    res.status(200).json({
      success: true,
      data: {
        users: { 
          total: userCount,
          lastWeek: 0 // Có thể bổ sung logic tính toán sau
        },
        documents: {
          total: documentCount,
          lastWeek: 0, 
          bySubject: formattedTopSubjects
        },
        subjects: {
          total: subjectCount
        },
        downloads: {
          total: totalDownloads,
          lastWeek: 0
        },
        topUsers: topUsers
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};