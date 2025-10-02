const authRouter = require('./auth');
const borrowRouter = require('./borrow');
function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/borrow', borrowRouter);
}

module.exports = route;