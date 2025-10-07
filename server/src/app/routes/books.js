const express = require('express');
const router = express.Router();
const BooksController = require('../controllers/BooksController');
const { verifyToken } = require('../middlewares/auth.middleware');

//Duong them cho home
router.get('/trending', verifyToken(), BooksController.getTrendingBooks);
router.get('/new-arrivals', verifyToken(), BooksController.getNewArrivals);
router.get('/recommended/', verifyToken(), BooksController.getRecommendedBooks);
router.get("/:id/copies",verifyToken(), BooksController.getBookCopies);

//
router.get('/export', verifyToken(), BooksController.exportBooks); 
router.get('/', verifyToken(), BooksController.getBooks);
router.get('/search', verifyToken(), BooksController.searchBooks);
router.get('/:id', verifyToken(), BooksController.getBookById); 
router.post('/', verifyToken(), BooksController.createBook);
router.put('/:id', verifyToken(), BooksController.updateBook);
router.delete('/:id', verifyToken(), BooksController.deleteBook);

module.exports = router;