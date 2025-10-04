const express = require('express');
const router = express.Router();
const PublishersController = require('../controllers/PublishersController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/export', verifyToken(), PublishersController.exportPublishers); 
router.get('/', verifyToken(), PublishersController.getPublishers); 
router.get('/:id', verifyToken(), PublishersController.getPublisherById);
router.post('/', verifyToken(), PublishersController.createPublisher);
router.put('/:id', verifyToken(), PublishersController.updatePublisher);
router.delete('/:id', verifyToken(), PublishersController.deletePublisher);

module.exports = router;