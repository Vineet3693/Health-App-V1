import { Repository } from 'typeorm';
import { User, UserRole } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { hashPassword } from '../utils/bcrypt';

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  profilePictureUrl?: string;
  preferences?: Record<string, any>;
  settings?: Record<string, any>;
}

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    Object.assign(user, input);
    await this.userRepository.save(user);
    
    return user;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isMatch = await require('../utils/bcrypt').comparePassword(currentPassword, user.password);
    
    if (!isMatch) {
      throw new AppError(401, 'Current password is incorrect');
    }

    user.password = await hashPassword(newPassword);
    await this.userRepository.save(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users, total };
  }

  async getUserStats(userId: string): Promise<any> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // TODO: Aggregate stats from health, nutrition, fitness records
    return {
      totalHealthRecords: 0,
      totalNutritionLogs: 0,
      totalFitnessLogs: 0,
      streak: 0,
    };
  }
}
