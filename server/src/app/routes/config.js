const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const configController = require('../controllers/ConfigController');
const Admin = verifyToken([0]);

router.get('/', Admin, configController.getConfig);
router.post('/', Admin, configController.createConfig);
router.put('/:id', Admin, configController.updateConfig);
router.delete('/:id', Admin, configController.deleteConfig);
router.post('/verify-delete-code', configController.verifyDeleteCode); 

module.exports = router;
