export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface IRequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export type UserRole = 'user' | 'provider' | 'admin';

export type HealthStatus = 'normal' | 'warning' | 'critical';

export interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
