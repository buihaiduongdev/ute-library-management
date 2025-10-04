const express = require('express');
const router = express.Router();
const AuthorsController = require('../controllers/AuthorsController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/export', verifyToken(), AuthorsController.exportAuthors); 
router.get('/', verifyToken(), AuthorsController.getAuthors); 
router.get('/search', verifyToken(), AuthorsController.searchAuthors); 
router.get('/:id', verifyToken(), AuthorsController.getAuthorById);
router.post('/', verifyToken(), AuthorsController.createAuthor);
router.put('/:id', verifyToken(), AuthorsController.updateAuthor);
router.delete('/:id', verifyToken(), AuthorsController.deleteAuthor);

module.exports = router;