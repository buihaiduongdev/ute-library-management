const express = require('express');
const router = express.Router();
const GenresController = require('../controllers/GenresController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', GenresController.getGenres); // ?search=query
router.get('/:id', GenresController.getGenreById);
router.post('/', verifyToken(['0', '1']), GenresController.createGenre);
router.put('/:id', verifyToken(['0', '1']), GenresController.updateGenre);
router.delete('/:id', verifyToken(['0', '1']), GenresController.deleteGenre);

module.exports = router;