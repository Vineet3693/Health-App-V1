import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date | string): string => {
  return moment(date).toISOString();
};

/**
 * Format date to custom format
 */
export const formatDateCustom = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  return moment(date).format(format);
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: Date | string): number => {
  return moment().diff(moment(dateOfBirth), 'years');
};

/**
 * Calculate BMI
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
};

/**
 * Classify BMI category
 */
export const classifyBMI = (bmi: number): string => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

/**
 * Convert units
 */
export const convertUnits = {
  kgToLbs: (kg: number): number => parseFloat((kg * 2.20462).toFixed(2)),
  lbsToKg: (lbs: number): number => parseFloat((lbs / 2.20462).toFixed(2)),
  cmToFt: (cm: number): number => parseFloat((cm / 30.48).toFixed(2)),
  ftToCm: (ft: number): number => parseFloat((ft * 30.48).toFixed(2)),
  celsiusToFahrenheit: (c: number): number => parseFloat(((c * 9/5) + 32).toFixed(2)),
  fahrenheitToCelsius: (f: number): number => parseFloat(((f - 32) * 5/9).toFixed(2)),
  kmToMiles: (km: number): number => parseFloat((km * 0.621371).toFixed(2)),
  milesToKm: (miles: number): number => parseFloat((miles / 0.621371).toFixed(2)),
  mlToOz: (ml: number): number => parseFloat((ml * 0.033814).toFixed(2)),
  ozToMl: (oz: number): number => parseFloat((oz / 0.033814).toFixed(2)),
};

/**
 * Paginate array
 */
export const paginate = <T>(array: T[], page: number, limit: number): { data: T[]; total: number; totalPages: number } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = array.slice(startIndex, endIndex);
  return {
    data: paginatedData,
    total: array.length,
    totalPages: Math.ceil(array.length / limit),
  };
};

/**
 * Sanitize object (remove sensitive fields)
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T, fieldsToRemove: string[]): T => {
  const sanitized = { ...obj };
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  return sanitized;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Sleep/delay utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Parse boolean from string
 */
export const parseBoolean = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

/**
 * Get initials from name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Mask email address
 */
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
  return `${maskedUsername}@${domain}`;
};

/**
 * Mask phone number
 */
export const maskPhone = (phone: string): string => {
  const lastFour = phone.slice(-4);
  return '*'.repeat(phone.length - 4) + lastFour;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate random number in range
 */
export const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Chunk array into smaller arrays
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
