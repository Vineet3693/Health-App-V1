import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { AppError } from '../../middlewares/error.middleware';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phoneNumber, dateOfBirth } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
      }

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
          },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
      }

      const result = await this.authService.login({ email, password });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
          },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError(400, 'Token is required');
      }

      const newToken = await this.authService.refreshToken(token);

      res.json({
        success: true,
        data: { token: newToken },
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError(400, 'Email is required');
      }

      await this.authService.forgotPassword(email);

      res.json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new AppError(400, 'Token and new password are required');
      }

      await this.authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.query;

      if (!token) {
        throw new AppError(400, 'Token is required');
      }

      await this.authService.verifyEmail(token as string);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      
      const user = await this.authService.getUserById(userId);

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          profilePictureUrl: user.profilePictureUrl,
          preferences: user.preferences,
          settings: user.settings,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
