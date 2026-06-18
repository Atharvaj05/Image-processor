/**
 * Global error handler.
 * Must be registered LAST with app.use() in app.js.
 * Express identifies it by the 4-argument signature.
 */
function errorHandler(err, req, res, next) {          // eslint-disable-line no-unused-vars
  console.error(err.stack);
  const status  = err.status  || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
