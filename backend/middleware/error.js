import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/** Turns express-validator results into a single 400 response. */
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((item) => ({ field: item.path, message: item.msg }));
  return next(ApiError.badRequest('Please correct the highlighted fields', errors));
}

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

/** Central error handler – always returns the same JSON shape. */
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use`;
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
    if (env.nodeEnv === 'production') message = 'Internal server error';
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (env.nodeEnv !== 'production' && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}
