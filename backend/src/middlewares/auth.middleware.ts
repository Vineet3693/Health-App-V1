import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { HTTP_STATUS } from '../utils/constants';
import { HttpError } from './error.middleware';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authenticate JWT token middleware
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError('Authorization token required', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const payload = verifyToken(token);

    // Attach user to request
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(new HttpError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_INVALID'));
    }
  }
};

/**
 * Authorize user roles middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new HttpError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} to ${req.path}`);
      return next(
        new HttpError('You do not have permission to perform this action', HTTP_STATUS.FORBIDDEN, 'INSUFFICIENT_PERMISSIONS')
      );
    }

    next();
  };
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

/**
 * Check if user is owner of resource
 */
export const isOwner = (paramName: string = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new HttpError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
    }

    const resourceId = req.params[paramName] || req.body.userId;
    
    if (req.user.role === 'admin' || req.user.id === resourceId) {
      return next();
    }

    return next(
      new HttpError('You can only access your own resources', HTTP_STATUS.FORBIDDEN, 'NOT_OWNER')
    );
  };
};

export default {
  authenticate,
  authorize,
  optionalAuth,
  isOwner,
};
