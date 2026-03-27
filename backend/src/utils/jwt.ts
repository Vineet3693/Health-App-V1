import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config';
import { ITokenPayload, IAuthTokens } from '../interfaces/auth.interface';

/**
 * Generate access token
 */
export const generateAccessToken = (payload: Omit<ITokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
    algorithm: jwtConfig.options.algorithm,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<ITokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: jwtConfig.issuer,
    algorithm: jwtConfig.options.algorithm,
  });
};

/**
 * Verify token
 */
export const verifyToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      algorithms: [jwtConfig.options.algorithm],
    }) as ITokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode token without verification
 */
export const decodeToken = (token: string): ITokenPayload | null => {
  return jwt.decode(token) as ITokenPayload | null;
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): number | null => {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};

/**
 * Generate auth tokens (access + refresh)
 */
export const generateAuthTokens = (payload: Omit<ITokenPayload, 'iat' | 'exp'>): IAuthTokens => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Calculate expires in milliseconds
  const expiresIn = parseExpiresIn(jwtConfig.expiresIn);
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

/**
 * Parse expires-in string to milliseconds
 */
const parseExpiresIn = (expiresIn: string): number => {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  
  const value = parseInt(expiresIn);
  const unit = expiresIn.slice(-1).toLowerCase();
  
  return value * (units[unit] || 1000);
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = (refreshToken: string): IAuthTokens => {
  const payload = verifyToken(refreshToken);
  return generateAuthTokens(payload);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  generateAuthTokens,
  refreshAccessToken,
};
