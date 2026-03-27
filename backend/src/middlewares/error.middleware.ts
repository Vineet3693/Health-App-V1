import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class HttpError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
  } else if (err.name === 'ForbiddenError') {
    statusCode = HTTP_STATUS.FORBIDDEN;
  } else if (err.name === 'NotFoundError') {
    statusCode = HTTP_STATUS.NOT_FOUND;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'Something went wrong';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new HttpError(
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

export default {
  errorHandler,
  notFoundHandler,
  HttpError,
};
