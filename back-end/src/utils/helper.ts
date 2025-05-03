import crypto from 'crypto';

/**
 * Generates a random reset password token, along with its hashed value.
 * @returns {{resetToken: string, hashedToken: string}}
 */
export const generateResetPasswordToken = (): { resetToken: string, hashedToken: string } => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

export const isNotValidResetToken = (resetToken: string, storedResetToken: string) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return hashedToken !== storedResetToken;
};
