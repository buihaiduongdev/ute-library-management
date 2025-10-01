const authRouter = require('./auth');
const readersRouter = require('./readers');

function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/readers', readersRouter);
}

module.exports = route;