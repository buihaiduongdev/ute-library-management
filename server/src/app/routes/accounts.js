const Router = require('express').Router();
const accountsController = require('../controllers/AccountsController');
const {verifyToken} = require('../middlewares/auth.middleware');
const admin = verifyToken([0]);

Router.get('/', admin, accountsController.getAccounts);
Router.get('/:id', admin, accountsController.getAccount);
Router.post('/', admin, accountsController.createAccount);
Router.put('/:id', admin, accountsController.updateAccount);
Router.delete('/:id', admin, accountsController.delAccount);

module.exports = Router;