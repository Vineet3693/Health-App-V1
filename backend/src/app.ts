import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';

import appConfig from './config/app.config';
import swaggerUi, { swaggerSpec, swaggerUiOptions } from './config/swagger.config';

// Middlewares
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { httpLogger, requestIdMiddleware } from './middlewares/logging.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';

// Routes
import authRoutes from './api/routes/auth.routes';
import userRoutes from './api/routes/user.routes';
import healthRoutes from './api/routes/health.routes';
import nutritionRoutes from './api/routes/nutrition.routes';
import fitnessRoutes from './api/routes/fitness.routes';
import telehealthRoutes from './api/routes/telehealth.routes';
import analyticsRoutes from './api/routes/analytics.routes';

class App {
  public app: Application;
  public port: number;
  public env: string;

  constructor() {
    this.app = express();
    this.port = appConfig.app.port;
    this.env = appConfig.app.env;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeDocs();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: appConfig.cors.origin,
      credentials: appConfig.cors.credentials,
    }));
    
    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());
    
    // Compression middleware
    this.app.use(compression());
    
    // Logging middleware
    this.app.use(httpLogger);
    this.app.use(requestIdMiddleware);
    
    // Rate limiting
    this.app.use(`/api/${appConfig.app.apiVersion}`, apiLimiter);
    
    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  private initializeRoutes(): void {
    const apiVersion = appConfig.app.apiVersion;
    const basePath = `/api/${apiVersion}`;
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.env,
      });
    });
    
    // API routes
    this.app.use(`${basePath}/auth`, authRoutes);
    this.app.use(`${basePath}/users`, userRoutes);
    this.app.use(`${basePath}/health`, healthRoutes);
    this.app.use(`${basePath}/nutrition`, nutritionRoutes);
    this.app.use(`${basePath}/fitness`, fitnessRoutes);
    this.app.use(`${basePath}/telehealth`, telehealthRoutes);
    this.app.use(`${basePath}/analytics`, analyticsRoutes);
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: appConfig.app.name,
        version: '1.0.0',
        environment: this.env,
        documentation: `/api-docs`,
        health: '/health',
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeDocs(): void {
    // Swagger API documentation
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );
    
    // Swagger JSON endpoint
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥 Health App API Server                                ║
║                                                           ║
║   Environment: ${this.env.padEnd(42)}║
║   Port: ${this.port.toString().padEnd(48)}║
║   API Version: ${appConfig.app.apiVersion.padEnd(41)}║
║                                                           ║
║   Documentation: http://localhost:${this.port}/api-docs${' '.repeat(32 - this.port.toString().length)}║
║   Health Check: http://localhost:${this.port}/health${' '.repeat(32 - this.port.toString().length)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default App;
