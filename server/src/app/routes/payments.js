const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Tất cả route đều cần authentication
router.use(verifyToken());

// [POST] /api/payments/create-qr - Tạo QR code thanh toán cho 1 phạt
router.post('/create-qr', PaymentController.createPaymentQR);

// [POST] /api/payments/check-transaction - Kiểm tra trạng thái thanh toán
router.post('/check-transaction', PaymentController.checkPaymentStatus);

// [GET] /api/payments/fines/unpaid - Lấy danh sách phạt chưa thanh toán
router.get('/fines/unpaid', PaymentController.getUnpaidFines);

// [POST] /api/payments/pay-multiple - Thanh toán nhiều phạt cùng lúc
router.post('/pay-multiple', PaymentController.createMultiplePaymentQR);

module.exports = router;
