const express = require('express');
const router = express.Router();
const PublishersController = require('../controllers/PublishersController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken(), PublishersController.getPublishers); // ?search=query&limit=8&offset=0
router.get('/:id', verifyToken(), PublishersController.getPublisherById);
router.post('/', verifyToken(), PublishersController.createPublisher);
router.put('/:id', verifyToken(), PublishersController.updatePublisher);
router.delete('/:id', verifyToken(), PublishersController.deletePublisher);

module.exports = router;