const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Route công khai, không cần xác thực
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
