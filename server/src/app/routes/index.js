const authRouter = require('./auth');
const borrowRouter = require('./borrow');
const readerRouter = require('./readers');
const statsRouter = require('./stats');
const readerStatsRouter = require('./reader-stats');

function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/borrow', borrowRouter);
    app.use('/api/readers', readerRouter);
    app.use('/api/stats', statsRouter);
    app.use('/api/reader-stats', readerStatsRouter);
}

module.exports = route;