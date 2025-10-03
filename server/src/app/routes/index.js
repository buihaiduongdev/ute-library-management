const authRouter = require('./auth');
const booksRouter = require('./books');
const authorsRouter = require('./authors');
const genresRouter = require('./genres');
const publishersRouter = require('./publishers');

function route(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/authors', authorsRouter);
  app.use('/api/genres', genresRouter);
  app.use('/api/publishers', publishersRouter);
}

module.exports = route;