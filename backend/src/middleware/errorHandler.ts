import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation Error',
      error: err.message
    });
    return;
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    res.status(409).json({
      message: 'Duplicate Error',
      error: 'Resource already exists'
    });
    return;
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};
