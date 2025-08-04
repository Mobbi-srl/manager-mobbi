import { createRateLimiter } from "@/utils/security/inputValidation";
import { SECURITY_CONFIG } from "@/utils/security/securityConfig";

// Rate limiter for password reset attempts
const passwordResetRateLimiter = createRateLimiter(
  SECURITY_CONFIG.PASSWORD_RESET_RATE_LIMIT.maxAttempts,
  SECURITY_CONFIG.PASSWORD_RESET_RATE_LIMIT.windowMs
);

export const usePasswordResetRateLimit = () => {
  const checkRateLimit = (): boolean => {
    return passwordResetRateLimiter.isAllowed();
  };

  const resetRateLimit = (): void => {
    passwordResetRateLimiter.reset();
  };

  return {
    checkRateLimit,
    resetRateLimit
  };
};