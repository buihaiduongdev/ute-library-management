const express = require('express');
const router = express.Router();
const GenresController = require('../controllers/GenresController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken(), GenresController.getGenres); // ?search=query&limit=8&offset=0
router.get('/:id', verifyToken(), GenresController.getGenreById);
router.post('/', verifyToken(), GenresController.createGenre);
router.put('/:id', verifyToken(), GenresController.updateGenre);
router.delete('/:id', verifyToken(), GenresController.deleteGenre);

module.exports = router;