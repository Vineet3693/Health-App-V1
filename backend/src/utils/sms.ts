import twilio from 'twilio';
import appConfig from '../config/app.config';
import logger from './logger';

const twilioConfig = appConfig.twilio;

let twilioClient: any = null;

if (twilioConfig.accountSid && twilioConfig.authToken) {
  twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
}

export interface ISMSOptions {
  to: string;
  message: string;
  from?: string;
}

/**
 * Send SMS using Twilio
 */
export const sendSMS = async (options: ISMSOptions): Promise<void> => {
  if (!twilioClient) {
    logger.warn('Twilio not configured. SMS not sent.');
    return;
  }

  try {
    await twilioClient.messages.create({
      body: options.message,
      from: options.from || twilioConfig.phoneNumber,
      to: options.to,
    });

    logger.info(`SMS sent to ${options.to}`);
  } catch (error) {
    logger.error('Failed to send SMS', { error, to: options.to });
    throw new Error(`Failed to send SMS: ${error}`);
  }
};

/**
 * Send verification code via SMS
 */
export const sendVerificationCode = async (phone: string, code: string): Promise<void> => {
  const message = `Your Health App verification code is: ${code}. This code will expire in 10 minutes.`;
  
  await sendSMS({
    to: phone,
    message,
  });
};

/**
 * Send appointment reminder via SMS
 */
export const sendAppointmentReminder = async (
  phone: string,
  doctorName: string,
  appointmentTime: string
): Promise<void> => {
  const message = `Reminder: You have an appointment with Dr. ${doctorName} at ${appointmentTime}. Reply CANCEL to cancel.`;
  
  await sendSMS({
    to: phone,
    message,
  });
};

/**
 * Send medication reminder via SMS
 */
export const sendMedicationReminder = async (
  phone: string,
  medicationName: string,
  dosage: string
): Promise<void> => {
  const message = `Medication Reminder: Time to take ${medicationName} (${dosage}).`;
  
  await sendSMS({
    to: phone,
    message,
  });
};

export default {
  sendSMS,
  sendVerificationCode,
  sendAppointmentReminder,
  sendMedicationReminder,
};
