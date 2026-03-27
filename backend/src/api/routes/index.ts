import { Router } from 'express';

const router = Router();

// Import route modules
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';
import nutritionRoutes from './nutrition.routes';
import fitnessRoutes from './fitness.routes';
import telehealthRoutes from './telehealth.routes';
import analyticsRoutes from './analytics.routes';

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/fitness', fitnessRoutes);
router.use('/telehealth', telehealthRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
