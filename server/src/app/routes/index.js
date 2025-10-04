const authRouter = require('./auth');
const booksRouter = require('./books');
const booksearchRouter = require('./booksearch');
const authorsRouter = require('./authors');
const genresRouter = require('./genres');
const publishersRouter = require('./publishers');
const borrowRouter = require('./borrow');

function route(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/booksearch', booksearchRouter);
  app.use('/api/authors', authorsRouter);
  app.use('/api/genres', genresRouter);
  app.use('/api/publishers', publishersRouter);
  app.use('/api/borrow', borrowRouter);
}

module.exports = route;