const express = require('express');
const { getStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getStats);

module.exports = router;