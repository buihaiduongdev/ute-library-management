const express = require('express');
const router = express.Router();
const PublishersController = require('../controllers/PublishersController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', PublishersController.getPublishers); // ?search=query
router.get('/:id', PublishersController.getPublisherById);
router.post('/', verifyToken(['0', '1']), PublishersController.createPublisher);
router.put('/:id', verifyToken(['0', '1']), PublishersController.updatePublisher);
router.delete('/:id', verifyToken(['0', '1']), PublishersController.deletePublisher);

module.exports = router;