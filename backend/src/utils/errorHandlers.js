export function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Resource not found' });
  next();
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
  next();
}
