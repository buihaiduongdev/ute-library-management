const express = require('express');
const router = express.Router();
const requestController = require('../controllers/RequestController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Middleware xác thực
const readerOnly = verifyToken([2]); // Chỉ độc giả
const staffOrAdmin = verifyToken([0, 1]); // Admin hoặc Staff
const allRoles = verifyToken([0, 1, 2]); // Tất cả roles

// [POST] /api/requests - Độc giả tạo yêu cầu mượn sách  
router.post('/', readerOnly, requestController.createRequest);

// [GET] /api/requests/my - Lấy yêu cầu của độc giả hiện tại
router.get('/my', readerOnly, requestController.getMyRequests);

// [GET] /api/requests/:id - Chi tiết yêu cầu
router.get('/:id', allRoles, requestController.getRequestById);

// [PUT] /api/requests/:id/approve - Duyệt yêu cầu (tạo phiếu mượn)
router.put('/:id/approve', staffOrAdmin, requestController.approveRequest);

// [PUT] /api/requests/:id/reject - Từ chối yêu cầu
router.put('/:id/reject', staffOrAdmin, requestController.rejectRequest);

// [GET] /api/requests - Lấy danh sách yêu cầu (với filter) - phải đặt cuối
router.get('/', staffOrAdmin, requestController.getRequests);

module.exports = router;