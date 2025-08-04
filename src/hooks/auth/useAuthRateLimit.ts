import { createRateLimiter } from "@/utils/security/inputValidation";

// Rate limiter for authentication attempts
const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

export const useAuthRateLimit = () => {
  const checkRateLimit = (): boolean => {
    return authRateLimiter.isAllowed();
  };

  const resetRateLimit = (): void => {
    authRateLimiter.reset();
  };

  return {
    checkRateLimit,
    resetRateLimit
  };
};