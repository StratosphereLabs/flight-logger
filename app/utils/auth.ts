import crypto from 'crypto';

export const TOKEN_SIZE = 32;

export const getPasswordResetToken = (): string => {
  const resetToken = crypto.randomBytes(TOKEN_SIZE).toString('hex');
  return crypto.createHash('sha256').update(resetToken).digest('hex');
};
