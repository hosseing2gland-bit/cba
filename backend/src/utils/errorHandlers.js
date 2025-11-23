import { ApiError, ERROR_CODES } from './errors.js';
import logger from './logger.js';

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'منبع مورد نظر یافت نشد'));
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;
  const message = status >= 500 ? 'خطای داخلی سرور رخ داد' : err.message || 'درخواست نامعتبر است';

  if (status >= 500) {
    logger.error({ err, requestId: req.id, path: req.originalUrl }, 'Unhandled error');
  } else {
    logger.warn({ err, requestId: req.id, path: req.originalUrl }, 'Request error');
  }

  res.status(status).json({
    code,
    message,
    requestId: req.id,
    details: status < 500 ? err.details : undefined,
  });
}

export function wrapAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
