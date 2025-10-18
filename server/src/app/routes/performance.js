const express = require('express');
const router = express.Router();
const {
  getPerformanceStats,
  getPerformanceLogs,
  resetPerformanceLogs,
  getStatsByEndpoint
} = require('../middlewares/performance.middleware');

// GET /api/performance/stats - Lấy thống kê tổng quan
router.get('/stats', (req, res) => {
  try {
    const stats = getPerformanceStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê performance',
      error: error.message
    });
  }
});

// GET /api/performance/logs - Lấy chi tiết logs
router.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getPerformanceLogs(limit);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy logs',
      error: error.message
    });
  }
});

// GET /api/performance/endpoints - Lấy thống kê theo endpoint
router.get('/endpoints', (req, res) => {
  try {
    const stats = getStatsByEndpoint();
    
    // Sắp xếp theo thời gian trung bình (chậm nhất lên đầu)
    const sortedStats = Object.entries(stats)
      .map(([endpoint, data]) => ({
        endpoint,
        ...data
      }))
      .sort((a, b) => {
        const aTime = parseFloat(a.averageTime);
        const bTime = parseFloat(b.averageTime);
        return bTime - aTime;
      });
    
    res.json({
      success: true,
      count: sortedStats.length,
      data: sortedStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê endpoints',
      error: error.message
    });
  }
});

// DELETE /api/performance/logs - Reset logs (chỉ admin)
router.delete('/logs', (req, res) => {
  try {
    resetPerformanceLogs();
    res.json({
      success: true,
      message: 'Đã reset performance logs thành công',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi reset logs',
      error: error.message
    });
  }
});

// GET /api/performance/export - Export logs ra JSON
router.get('/export', (req, res) => {
  try {
    const stats = getPerformanceStats();
    const logs = getPerformanceLogs(1000);
    const endpointStats = getStatsByEndpoint();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: stats,
      endpointStats: endpointStats,
      logs: logs
    };
    
    // Set headers để download file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=performance_report_${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export dữ liệu',
      error: error.message
    });
  }
});

module.exports = router;




