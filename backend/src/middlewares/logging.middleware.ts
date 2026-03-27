import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import logger, { stream } from '../utils/logger';

/**
 * Morgan middleware configuration
 */
export const httpLogger = morgan(
  // Custom format
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream,
    skip: (req, res) => {
      // Skip logging for health checks in production
      if (process.env.NODE_ENV === 'production' && req.url === '/health') {
        return true;
      }
      return false;
    },
  }
);

/**
 * Request ID middleware
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Generate unique request ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request timing middleware
 */
export const requestTimingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id'],
    });
  });
  
  next();
};

/**
 * Log request details middleware
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: sanitizeHeaders(req.headers),
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });
  
  next();
};

/**
 * Sanitize headers for logging (remove sensitive data)
 */
const sanitizeHeaders = (headers: any): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie'];
  
  Object.keys(headers).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (!sensitiveHeaders.includes(lowerKey)) {
      sanitized[key] = headers[key] as string;
    } else {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

export default {
  httpLogger,
  requestIdMiddleware,
  requestTimingMiddleware,
  requestLoggerMiddleware,
};
