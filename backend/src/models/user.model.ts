import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { HealthRecord } from './health.model';
import { NutritionLog } from './nutrition.model';
import { FitnessLog } from './fitness.model';
import { Appointment } from './appointment.model';

export enum UserRole {
  USER = 'user',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  TRAINER = 'trainer'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @OneToMany(() => HealthRecord, (record) => record.user)
  healthRecords: HealthRecord[];

  @OneToMany(() => NutritionLog, (log) => log.user)
  nutritionLogs: NutritionLog[];

  @OneToMany(() => FitnessLog, (log) => log.user)
  fitnessLogs: FitnessLog[];

  @OneToMany(() => Appointment, (apt) => apt.patient)
  appointmentsAsPatient: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}