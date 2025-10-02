const express = require('express');
const router = express.Router;
const { verifyToken } = require('../middlewares/auth.middleware');

const admin = verifyToken([0]);

module.exports = router;
