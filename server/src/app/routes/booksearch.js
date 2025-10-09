const express = require('express');
const router = express.Router();
const BookSearchController = require('../controllers/BookSearchController');

// Public routes (không yêu cầu xác thực)
router.get('/', BookSearchController.getBooks);
router.get('/trending', BookSearchController.getTrendingBooks);
router.get('/new-arrivals', BookSearchController.getNewArrivals);
router.get('/:id', BookSearchController.getBookById);

module.exports = router;