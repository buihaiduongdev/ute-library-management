const express = require('express');
const router = express.Router();
const AuthorsController = require('../controllers/AuthorsController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', AuthorsController.getAuthors); // ?search=query
router.get('/:id', AuthorsController.getAuthorById);
router.post('/', verifyToken(['0', '1']), AuthorsController.createAuthor);
router.put('/:id', verifyToken(['0', '1']), AuthorsController.updateAuthor);
router.delete('/:id', verifyToken(['0', '1']), AuthorsController.deleteAuthor);

module.exports = router;