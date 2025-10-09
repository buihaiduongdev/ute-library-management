const authRouter = require('./auth');
const booksRouter = require('./books');
const booksearchRouter = require('./booksearch');
const authorsRouter = require('./authors');
const genresRouter = require('./genres');
const publishersRouter = require('./publishers');
const borrowRouter = require('./borrow');
const statisticsRouter = require('./statistics');
const requestsRouter = require('./requests');
const readerRouter = require('./readers');
const statsRouter = require('./stats');
const readerStatsRouter = require('./reader-stats');
const configRouter = require('./config');

function route(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/booksearch', booksearchRouter);
  app.use('/api/authors', authorsRouter);
  app.use('/api/genres', genresRouter);
  app.use('/api/publishers', publishersRouter);
  app.use('/api/borrow', borrowRouter);
  app.use('/api/statistics', statisticsRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/readers', readerRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/reader-stats', readerStatsRouter);
  app.use('/api/configs', configRouter);
}

module.exports = route;
