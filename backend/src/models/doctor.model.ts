import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DoctorSpecialization {
  GENERAL_PRACTICE = 'general_practice',
  CARDIOLOGY = 'cardiology',
  DERMATOLOGY = 'dermatology',
  ENDOCRINOLOGY = 'endocrinology',
  GASTROENTEROLOGY = 'gastroenterology',
  NEUROLOGY = 'neurology',
  ONCOLOGY = 'oncology',
  PEDIATRICS = 'pediatrics',
  PSYCHIATRY = 'psychiatry',
  ORTHOPEDICS = 'orthopedics',
  NUTRITIONIST = 'nutritionist',
  FITNESS_TRAINER = 'fitness_trainer'
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: DoctorSpecialization })
  specialization: DoctorSpecialization;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  hospitalAffiliation: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'integer', default: 0 })
  reviewCount: number;

  @Column({ type: 'float', nullable: true })
  consultationFee: number;

  @Column({ type: 'jsonb', nullable: true })
  availability: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  education: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  certifications: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isAcceptingPatients: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}