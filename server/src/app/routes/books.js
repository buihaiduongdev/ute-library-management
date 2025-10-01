const express = require('express');
const router = express.Router();
const BooksController = require('../controllers/BooksController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', BooksController.getBooks); // ?search=query&limit=10&offset=0
router.get('/search', BooksController.searchBooks); // Tìm kiếm nâng cao
router.get('/:id', BooksController.getBookById);
router.post('/', verifyToken(['0', '1']), BooksController.createBook);
router.put('/:id', verifyToken(['0', '1']), BooksController.updateBook);
router.delete('/:id', verifyToken(['0', '1']), BooksController.deleteBook);

module.exports = router;