const express = require('express');
const router = express.Router();
const readerController = require('../controllers/ReaderController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Định nghĩa vai trò cho các route
const ADMIN_ROLE = 1;
const STAFF_ROLE = 3; 
const READER_ROLE = 2;

// GET /api/readers - Lấy danh sách tất cả độc giả (Chỉ Admin và Nhân viên)
router.get('/', verifyToken([ADMIN_ROLE, STAFF_ROLE]), readerController.getAllReaders);

// GET /api/readers/:id - Lấy thông tin chi tiết một độc giả (Admin, Nhân viên, hoặc chính độc giả đó)
router.get('/:id', verifyToken([ADMIN_ROLE, STAFF_ROLE, READER_ROLE]), readerController.getReaderById);

// POST /api/readers - Tạo một độc giả mới (Công khai hoặc chỉ Admin)
// Hiện tại chúng ta sẽ để cho Admin tạo, tương tự như việc đăng ký
router.post('/', verifyToken([ADMIN_ROLE]), readerController.createReader);

// PUT /api/readers/:id - Cập nhật thông tin độc giả (Admin hoặc chính độc giả đó)
router.put('/:id', verifyToken([ADMIN_ROLE, READER_ROLE]), readerController.updateReader);

// DELETE /api/readers/:id - Xóa một độc giả (Chỉ Admin)
router.delete('/:id', verifyToken([ADMIN_ROLE]), readerController.deleteReader);

module.exports = router;
