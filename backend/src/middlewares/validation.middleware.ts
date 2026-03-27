import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { HTTP_STATUS } from '../utils/constants';
import { HttpError } from './error.middleware';

/**
 * Validate request middleware
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: (err as any).path,
      message: err.msg,
      value: (err as any).value,
    }));
    
    return next(
      new HttpError('Validation failed', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR')
    );
  }
  
  next();
};

/**
 * Create validation error response
 */
export const formatValidationErrors = (errors: any[]): Record<string, string[]> => {
  return errors.reduce((acc, err: any) => {
    const field = err.path;
    if (!acc[field]) {
      acc[field] = [];
    }
    acc[field].push(err.msg);
    return acc;
  }, {} as Record<string, string[]>);
};

/**
 * Async validation wrapper
 */
export const asyncValidate = (validationChains: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await Promise.all(validationChains.map(chain => chain.run(req)));
      validate(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default {
  validate,
  formatValidationErrors,
  asyncValidate,
};
