import { Repository } from 'typeorm';
import { User, UserRole } from '../models/user.model';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import { generateToken, verifyToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import { AppError } from '../middlewares/error.middleware';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  constructor(private userRepository: Repository<User>) {}

  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findOne({ where: { email: input.email } });
    
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = this.userRepository.create({
      ...input,
      password: hashedPassword,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Health App!',
      html: `<h1>Welcome ${user.firstName || 'to Health App'}!</h1><p>Your account has been created successfully.</p>`,
    });

    return { user, token };
  }

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({ where: { email: input.email } });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async refreshToken(token: string): Promise<string> {
    try {
      const payload = verifyToken(token) as TokenPayload;
      
      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      
      if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid token');
      }

      return generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new AppError(401, 'Invalid or expired token');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    const resetToken = generateToken({ userId: user.id, email: user.email, role: user.role }, '1h');
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<h1>Password Reset</h1><p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a><p>This link expires in 1 hour.</p>`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = verifyToken(token) as TokenPayload;
      
      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      user.password = await hashPassword(newPassword);
      await this.userRepository.save(user);
    } catch (error) {
      throw new AppError(400, 'Invalid or expired token');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const payload = verifyToken(token) as TokenPayload;
      
      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      user.emailVerified = true;
      await this.userRepository.save(user);
    } catch (error) {
      throw new AppError(400, 'Invalid or expired token');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}