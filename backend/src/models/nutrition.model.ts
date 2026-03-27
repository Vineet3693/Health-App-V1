import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.model';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack'
}

@Entity('nutrition_logs')
export class NutritionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.nutritionLogs)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: MealType })
  mealType: MealType;

  @Column()
  foodName: string;

  @Column({ type: 'float' })
  calories: number;

  @Column({ type: 'float', nullable: true })
  protein: number;

  @Column({ type: 'float', nullable: true })
  carbohydrates: number;

  @Column({ type: 'float', nullable: true })
  fat: number;

  @Column({ type: 'float', nullable: true })
  fiber: number;

  @Column({ type: 'float', nullable: true })
  sugar: number;

  @Column({ type: 'float', nullable: true })
  sodium: number;

  @Column({ type: 'float', default: 1.0 })
  servingSize: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  loggedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}