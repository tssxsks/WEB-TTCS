// controllers/feedbackController.js
const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { fullname, email, content } = req.body;

    // Kiểm tra nếu thiếu trường nào
    if (!fullname || !email || !content) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
    }

    // Tạo mới đối tượng Feedback và lưu vào DB
    const newFeedback = new Feedback({ fullname, email, content });
    await newFeedback.save();

    return res.status(201).json({ message: "Cảm ơn bạn đã gửi feedback!" });
  } catch (error) {
    console.error("Error when saving feedback:", error);
    return res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau." });
  }
};