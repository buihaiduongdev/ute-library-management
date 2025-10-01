const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/BorrowController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Middleware xác thực
const staffOrAdmin = verifyToken([0, 1]); // Admin hoặc Staff
const allRoles = verifyToken([0, 1, 2]); // Tất cả roles

/**
 * @route   POST /api/borrow
 * @desc    Tạo phiếu mượn sách mới
 * @access  Private (Admin, Staff)
 */
router.post('/', staffOrAdmin, borrowController.createBorrow);

/**
 * @route   GET /api/borrow/statistics
 * @desc    Thống kê mượn trả sách
 * @access  Private (Admin, Staff)
 */
router.get('/statistics', staffOrAdmin, borrowController.getStatistics);

/**
 * @route   GET /api/borrow/overdue
 * @desc    Lấy danh sách sách quá hạn
 * @access  Private (Admin, Staff)
 */
router.get('/overdue', staffOrAdmin, borrowController.getOverdueBooks);

/**
 * @route   GET /api/borrow/fines
 * @desc    Lấy danh sách phạt chưa thanh toán
 * @access  Private (Admin, Staff)
 */
router.get('/fines', staffOrAdmin, borrowController.getUnpaidFines);

/**
 * @route   GET /api/borrow/reader/:idDG
 * @desc    Lấy lịch sử mượn sách của độc giả
 * @access  Private (All roles)
 */
router.get('/reader/:idDG', allRoles, borrowController.getReaderHistory);

/**
 * @route   GET /api/borrow/:id
 * @desc    Lấy chi tiết phiếu mượn theo ID
 * @access  Private (Admin, Staff)
 */
router.get('/:id', staffOrAdmin, borrowController.getBorrowById);

/**
 * @route   GET /api/borrow
 * @desc    Lấy danh sách phiếu mượn (có phân trang và filter)
 * @access  Private (Admin, Staff)
 */
router.get('/', staffOrAdmin, borrowController.getBorrows);

/**
 * @route   POST /api/borrow/return
 * @desc    Trả sách
 * @access  Private (Admin, Staff)
 */
router.post('/return', staffOrAdmin, borrowController.returnBooks);

/**
 * @route   POST /api/borrow/pay-fine/:maPhat
 * @desc    Thanh toán phạt
 * @access  Private (Admin, Staff)
 */
router.post('/pay-fine/:maPhat', staffOrAdmin, borrowController.payFine);

module.exports = router;