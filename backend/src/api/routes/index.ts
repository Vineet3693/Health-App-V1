import { Router, Request, Response } from 'express';
import { setupAuthRoutes } from './auth.routes';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { getRepository } from 'typeorm';
import { User } from '../../models/user.model';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Initialize controllers and services
const userRepository = getRepository(User);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Health App API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Setup routes
router.use('/auth', setupAuthRoutes(authController));

// Protected example route
router.get('/protected', authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'You have accessed a protected route',
    user: (req as any).user,
  });
});

export default router;
