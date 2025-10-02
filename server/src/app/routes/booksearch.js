const express = require('express');
const router = express.Router();
const BookSearchController = require('../controllers/BookSearchController');

router.get('/', BookSearchController.getBooks);
router.get('/:id', BookSearchController.getBookById);

module.exports = router;