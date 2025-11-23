import { matchedData, validationResult } from 'express-validator';
import { ApiError, ERROR_CODES } from '../utils/errors.js';

export function validationChain(rules) {
  return [...rules, handleValidation];
}

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'درخواست نامعتبر است', {
      fields: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        location: error.location,
      })),
    }));
  }
  req.validated = matchedData(req, { includeOptionals: true, locations: ['body', 'params', 'query'] });
  return next();
}
