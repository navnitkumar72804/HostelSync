export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled error:', err);
    if (err.stack) console.error(err.stack);
  }

  const payload = {
    message: err.message || 'Internal server error',
    path: req.originalUrl,
    method: req.method
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
}

export default errorHandler;


