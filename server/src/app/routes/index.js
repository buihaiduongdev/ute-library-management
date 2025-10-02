const authRouter = require('./auth');
const borrowRouter = require('./borrow');
const readerRouter = require('./readers');

function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/borrow', borrowRouter);
    app.use('/api/readers', readerRouter);
}

module.exports = route;