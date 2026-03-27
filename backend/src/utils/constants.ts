// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
  ADMIN: 'admin',
};

// Health Status
export const HEALTH_STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// Symptom Severity
export const SYMPTOM_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
};

// Gender Options
export const GENDER_OPTIONS = ['male', 'female', 'other', 'prefer_not_to_say'];

// Units of Measurement
export const UNITS = {
  WEIGHT: ['kg', 'lbs'],
  HEIGHT: ['cm', 'ft'],
  TEMPERATURE: ['celsius', 'fahrenheit'],
  DISTANCE: ['km', 'miles'],
};

// Notification Types
export const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  ACHIEVEMENT: 'achievement',
  MESSAGE: 'message',
  SYSTEM: 'system',
  HEALTH_ALERT: 'health_alert',
};

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

// Date Formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
};

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  HEALTH_RECORDS: 'health:records:',
  NUTRITION_DATA: 'nutrition:data:',
  FITNESS_STATS: 'fitness:stats:',
  SESSION: 'session:',
  TOKEN_BLACKLIST: 'token:blacklist:',
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
  VERY_LONG: 604800, // 7 days
};

// Rate Limiting
export const RATE_LIMITS = {
  API: { windowMs: 900000, max: 100 }, // 15 minutes, 100 requests
  AUTH: { windowMs: 900000, max: 5 }, // 15 minutes, 5 attempts
  UPLOAD: { windowMs: 3600000, max: 10 }, // 1 hour, 10 uploads
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  DESTINATION: 'uploads/',
};

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};

// Token Expiry
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  EMAIL_VERIFICATION: '24h',
  PASSWORD_RESET: '1h',
};

// Days of Week
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// Meal Types
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

// Workout Types
export const WORKOUT_TYPES = [
  'cardio',
  'strength',
  'flexibility',
  'balance',
  'hiit',
  'yoga',
  'pilates',
  'sports',
  'other',
];

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};
