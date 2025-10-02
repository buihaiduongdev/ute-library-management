const express = require('express');
const router = express.Router();
const readerController = require('../controllers/ReaderController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Route for getting all readers
router.get('/', verifyToken(['admin']), readerController.getAllReaders);

// Route for getting a reader by ID
router.get('/:id', verifyToken(['admin']), readerController.getReaderById);

// Route for creating a new reader
router.post('/', verifyToken(['admin']), readerController.createReader);

// Route for updating a reader by ID
router.put('/:id', verifyToken(['admin']), readerController.updateReader);

// Route for deleting a reader by ID
router.delete('/:id', verifyToken(['admin']), readerController.deleteReader);

module.exports = router;
