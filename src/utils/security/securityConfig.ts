// Security configuration constants
export const SECURITY_CONFIG = {
  // Rate limiting configurations
  AUTH_RATE_LIMIT: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  PASSWORD_RESET_RATE_LIMIT: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Input validation configurations
  INPUT_VALIDATION: {
    maxStringLength: 1000,
    maxEmailLength: 254,
    maxPhoneLength: 20,
  },
  
  // XSS protection patterns
  XSS_PROTECTION: {
    dangerousChars: /[<>\\"'&]/g,
    scriptPatterns: /(<script[\s\S]*?<\/script>|javascript:|on\w+\s*=)/gi,
  },
  
  // Audit logging settings
  AUDIT_LOGGING: {
    enabledEvents: [
      'login_attempt',
      'login_success', 
      'login_failed',
      'password_reset_request',
      'user_role_change',
      'sensitive_data_access',
      'bulk_operation'
    ],
    retentionDays: 90,
  }
} as const;

// Security helper functions
export const securityHelpers = {
  // Check if content contains potentially dangerous patterns
  containsDangerousContent: (content: string): boolean => {
    return SECURITY_CONFIG.XSS_PROTECTION.scriptPatterns.test(content);
  },
  
  // Generate secure audit ID
  generateAuditId: (): string => {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Check if audit event should be logged
  shouldLogEvent: (eventType: string): boolean => {
    return SECURITY_CONFIG.AUDIT_LOGGING.enabledEvents.includes(eventType as any);
  }
};