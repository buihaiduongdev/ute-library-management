const authRouter = require('./auth');

function route(app) {
    app.use('/api/auth', authRouter);
    // app.use('api/books', )
}

module.exports = route;