const express = require('express');
const router = express.Router();
const statsController = require('../controllers/StatsController');

// Route chính cho thống kê dashboard
// GET /api/stats/dashboard
router.get('/dashboard', statsController.getDashboardStats);


module.exports = router;
