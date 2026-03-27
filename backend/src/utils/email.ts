import sgMail from '@sendgrid/mail';
import appConfig from '../config/app.config';
import logger from './logger';

const sendgridConfig = appConfig.sendgrid;

if (sendgridConfig.apiKey) {
  sgMail.setApiKey(sendgridConfig.apiKey);
}

export interface IEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

/**
 * Send email using SendGrid
 */
export const sendEmail = async (options: IEmailOptions): Promise<void> => {
  if (!sendgridConfig.apiKey) {
    logger.warn('SendGrid API key not configured. Email not sent.');
    return;
  }

  try {
    const msg = {
      to: options.to,
      from: options.from || sendgridConfig.fromEmail,
      subject: options.subject,
      text: options.text || stripHtml(options.html),
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    await sgMail.send(msg);
    logger.info(`Email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`, {
      subject: options.subject,
    });
  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to, subject: options.subject });
    throw new Error(`Failed to send email: ${error}`);
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const html = `
    <h1>Welcome to Health App!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for joining Health App. We're excited to help you on your wellness journey!</p>
    <p>Get started by:</p>
    <ul>
      <li>Completing your profile</li>
      <li>Setting your health goals</li>
      <li>Connecting your wearable devices</li>
    </ul>
    <p>Best regards,<br>The Health App Team</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Health App!',
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  appName: string = 'Health App'
): Promise<void> => {
  const resetUrl = `${appConfig.app.url}/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password for ${appName}.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
  });
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${appConfig.app.url}/verify-email?token=${verificationToken}`;
  
  const html = `
    <h1>Verify Your Email</h1>
    <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>Or copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html,
  });
};

/**
 * Strip HTML tags from string
 */
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
