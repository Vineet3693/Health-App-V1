import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validation.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';

const router = Router();

export function setupAuthRoutes(authController: AuthController): Router {
  // Public routes
  router.post('/register', registerValidator, validateRequest, (req, res, next) =>
    authController.register(req, res, next)
  );

  router.post('/login', loginValidator, validateRequest, (req, res, next) =>
    authController.login(req, res, next)
  );

  router.post('/refresh-token', (req, res, next) =>
    authController.refreshToken(req, res, next)
  );

  router.post('/forgot-password', (req, res, next) =>
    authController.forgotPassword(req, res, next)
  );

  router.post('/reset-password', (req, res, next) =>
    authController.resetPassword(req, res, next)
  );

  router.get('/verify-email', (req, res, next) =>
    authController.verifyEmail(req, res, next)
  );

  // Protected routes
  router.get('/me', authMiddleware, (req, res, next) =>
    authController.getMe(req, res, next)
  );

  return router;
}

export default router;
