const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/BorrowController");
const { verifyToken } = require("../middlewares/auth.middleware");

// Middleware xác thực
const staffOrAdmin = verifyToken([0, 1]); // Admin hoặc Staff
const allRoles = verifyToken([0, 1, 2]); // Tất cả roles

/**
 * Routes cụ thể phải đặt TRƯỚC routes động (:id)
 * để tránh conflict routing
 */

// [GET] Lấy cấu hình hệ thống
router.get(
  "/config",
  allRoles,
  borrowController.getConfig
);

// [GET] Lấy danh sách cuốn sách có sẵn
router.get(
  "/available-copies",
  staffOrAdmin,
  borrowController.getAvailableCopies
);

// [GET] Thống kê mượn trả
router.get("/statistics", staffOrAdmin, borrowController.getStatistics);

// [GET] Danh sách sách quá hạn
router.get("/overdue", staffOrAdmin, borrowController.getOverdueBooks);

// [GET] Danh sách phạt chưa thanh toán
router.get("/fines", staffOrAdmin, borrowController.getUnpaidFines);

// [GET] Lịch sử mượn của độc giả
router.get("/reader/:idDG", allRoles, borrowController.getReaderHistory);

// [GET] Chi tiết phiếu mượn theo ID (phải đặt sau các routes /something)
router.get("/:id", staffOrAdmin, borrowController.getBorrowById);

// [POST] Tạo phiếu mượn mới
router.post("/", staffOrAdmin, borrowController.createBorrow);

// [GET] Danh sách phiếu mượn (có filter, pagination)
router.get("/", staffOrAdmin, borrowController.getBorrows);

// [POST] Trả sách
router.post("/return", staffOrAdmin, borrowController.returnBooks);

// [POST] Thanh toán phạt
router.post("/pay-fine/:maPhat", staffOrAdmin, borrowController.payFine);

module.exports = router;
