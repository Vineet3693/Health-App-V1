import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentType } from '../models/appointment.model';
import { Doctor, DoctorSpecialization } from '../models/doctor.model';
import { AppError } from '../middlewares/error.middleware';

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  type: AppointmentType;
  scheduledAt: Date;
  duration: number;
  reason?: string;
}

export class TelehealthService {
  constructor(
    private appointmentRepository: Repository<Appointment>,
    private doctorRepository: Repository<Doctor>
  ) {}

  async getDoctors(filters?: { specialization?: DoctorSpecialization; isVerified?: boolean }): Promise<Doctor[]> {
    const query = this.doctorRepository.createQueryBuilder('doctor')
      .where('doctor.isActive = :isActive', { isActive: true })
      .andWhere('doctor.isAcceptingPatients = :isAcceptingPatients', { isAcceptingPatients: true });

    if (filters?.specialization) {
      query.andWhere('doctor.specialization = :specialization', { specialization: filters.specialization });
    }

    if (filters?.isVerified !== undefined) {
      query.andWhere('doctor.isVerified = :isVerified', { isVerified: filters.isVerified });
    }

    return await query.orderBy('doctor.rating', 'DESC').getMany();
  }

  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    return await this.doctorRepository.findOne({ where: { id: doctorId } });
  }

  async bookAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const doctor = await this.getDoctorById(input.doctorId);
    
    if (!doctor) {
      throw new AppError(404, 'Doctor not found');
    }

    if (!doctor.isAcceptingPatients) {
      throw new AppError(400, 'Doctor is not accepting patients');
    }

    // Check for scheduling conflicts
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctorId: input.doctorId,
        scheduledAt: input.scheduledAt,
        status: AppointmentStatus.CONFIRMED,
      },
    });

    if (existingAppointments.length > 0) {
      throw new AppError(400, 'Time slot is not available');
    }

    const appointment = this.appointmentRepository.create({
      ...input,
      status: AppointmentStatus.PENDING,
    });

    return await this.appointmentRepository.save(appointment);
  }

  async getAppointments(patientId: string, status?: AppointmentStatus): Promise<Appointment[]> {
    const query = this.appointmentRepository.createQueryBuilder('appointment')
      .where('appointment.patientId = :patientId', { patientId });

    if (status) {
      query.andWhere('appointment.status = :status', { status });
    }

    return await query.orderBy('appointment.scheduledAt', 'DESC').getMany();
  }

  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } });

    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    return await this.appointmentRepository.save(appointment);
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } });

    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    if (reason) {
      appointment.notes = reason;
    }
    return await this.appointmentRepository.save(appointment);
  }

  async completeAppointment(appointmentId: string, notes?: string, prescriptionUrl?: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } });

    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }

    appointment.status = AppointmentStatus.COMPLETED;
    if (notes) appointment.notes = notes;
    if (prescriptionUrl) appointment.prescriptionUrl = prescriptionUrl;

    return await this.appointmentRepository.save(appointment);
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    return await this.appointmentRepository.findOne({ where: { id: appointmentId } });
  }
}
