const express = require('express');
const router = express.Router();
const readerController = require('../controllers/ReaderController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Route for getting all readers
router.get('/', verifyToken([0]), readerController.getAllReaders);

// Route for getting a reader by ID
router.get('/:id', verifyToken([0]), readerController.getReaderById);

// Route for creating a new reader
router.post('/', verifyToken([0]), readerController.createReader);

// Route for updating a reader by ID
router.put('/:id', verifyToken([0]), readerController.updateReader);

// Route for deleting a reader by ID
router.delete('/:id', verifyToken([0]), readerController.deleteReader);

module.exports = router;
