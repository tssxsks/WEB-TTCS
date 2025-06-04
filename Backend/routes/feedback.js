// routes/feedback.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Route post feedback: POST /api/feedback
router.post('/', feedbackController.createFeedback);

module.exports = router;