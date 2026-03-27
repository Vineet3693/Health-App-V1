import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Check if string is a valid bcrypt hash
 */
export const isValidHash = (hash: string): boolean => {
  const bcryptRegex = /^\$2[aby]\$\d+\$.{53}$/;
  return bcryptRegex.test(hash);
};

/**
 * Get hash info (for debugging)
 */
export const getHashInfo = (hash: string): { version: string; rounds: number } | null => {
  if (!isValidHash(hash)) return null;
  
  const parts = hash.split('$');
  return {
    version: parts[1],
    rounds: parseInt(parts[2]),
  };
};

export default {
  hashPassword,
  comparePassword,
  isValidHash,
  getHashInfo,
};
