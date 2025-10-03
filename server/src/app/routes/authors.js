const express = require('express');
const router = express.Router();
const AuthorsController = require('../controllers/AuthorsController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken(), AuthorsController.getAuthors); // ?search=query&limit=8&offset=0
router.get('/search', verifyToken(), AuthorsController.searchAuthors); // Tìm kiếm nâng cao
router.get('/:id', verifyToken(), AuthorsController.getAuthorById);
router.post('/', verifyToken(), AuthorsController.createAuthor);
router.put('/:id', verifyToken(), AuthorsController.updateAuthor);
router.delete('/:id', verifyToken(), AuthorsController.deleteAuthor);

module.exports = router;