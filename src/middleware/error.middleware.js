import mongoose from 'mongoose';
import { ZodError } from 'zod';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed.',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, error: 'Invalid resource id.' });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ success: false, error: 'A record with that value already exists.' });
  }

  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: status === 500 ? 'Internal server error.' : error.message
  });
}
