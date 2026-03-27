import { sendEmail } from '../utils/email';
import { sendSMS } from '../utils/sms';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSNotification {
  to: string;
  body: string;
}

export class NotificationService {
  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      await sendEmail(notification);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendSMS(notification: SMSNotification): Promise<void> {
    try {
      await sendSMS(notification.to, notification.body);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendAppointmentReminder(
    email: string,
    phone: string,
    doctorName: string,
    appointmentDate: Date
  ): Promise<void> {
    const subject = 'Appointment Reminder';
    const html = `
      <h1>Appointment Reminder</h1>
      <p>You have an upcoming appointment with Dr. ${doctorName}</p>
      <p>Date: ${appointmentDate.toLocaleString()}</p>
      <p>Please be on time for your appointment.</p>
    `;

    await this.sendEmail({ to: email, subject, html });
    await this.sendSMS({
      to: phone,
      body: `Reminder: You have an appointment with Dr. ${doctorName} on ${appointmentDate.toLocaleString()}`,
    });
  }

  async sendMedicationReminder(email: string, phone: string, medicationName: string): Promise<void> {
    const subject = 'Medication Reminder';
    const html = `
      <h1>Time to take your medication</h1>
      <p>This is a reminder to take your medication: ${medicationName}</p>
    `;

    await this.sendEmail({ to: email, subject, html });
    await this.sendSMS({
      to: phone,
      body: `Reminder: Time to take ${medicationName}`,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = 'Welcome to Health App!';
    const html = `
      <h1>Welcome ${firstName || 'to Health App'}!</h1>
      <p>We're excited to have you on board.</p>
      <p>Start tracking your health journey today!</p>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}
