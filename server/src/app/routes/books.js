const express = require('express');
const router = express.Router();
const BooksController = require('../controllers/BooksController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken(), BooksController.getBooks); // ?search=query&limit=10&offset=0
router.get('/search', verifyToken(), BooksController.searchBooks); // Tìm kiếm nâng cao
router.get('/:id', verifyToken(), BooksController.getBookById);
router.post('/', verifyToken(), BooksController.createBook);
router.put('/:id', verifyToken(), BooksController.updateBook);
router.delete('/:id', verifyToken(), BooksController.deleteBook);

module.exports = router;