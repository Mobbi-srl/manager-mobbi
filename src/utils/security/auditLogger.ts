// Audit logging utilities for security monitoring

import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  action: string;
  resource: string;
  details?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Log security events for audit trail
export const auditLogger = {
  // Log authentication events
  auth: async (action: 'login' | 'logout' | 'failed_login' | 'password_reset', details?: Record<string, any>) => {
    return auditLogger.log({
      action,
      resource: 'authentication',
      details,
      severity: action === 'failed_login' ? 'medium' : 'low'
    });
  },

  // Log data access events
  dataAccess: async (action: 'read' | 'create' | 'update' | 'delete', resource: string, details?: Record<string, any>) => {
    return auditLogger.log({
      action: `data_${action}`,
      resource,
      details,
      severity: action === 'delete' ? 'high' : 'low'
    });
  },

  // Log admin actions
  admin: async (action: string, resource: string, details?: Record<string, any>) => {
    return auditLogger.log({
      action: `admin_${action}`,
      resource,
      details,
      severity: 'high'
    });
  },

  // Log security violations
  security: async (action: string, details?: Record<string, any>) => {
    return auditLogger.log({
      action: `security_${action}`,
      resource: 'security',
      details,
      severity: 'critical'
    });
  },

  // Generic log function
  log: async (entry: AuditLogEntry) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        tipo: 'audit_log',
        descrizione: `${entry.action} on ${entry.resource}`,
        dati: {
          ...entry.details,
          action: entry.action,
          resource: entry.resource,
          severity: entry.severity || 'low',
          timestamp: new Date().toISOString(),
          userId: user?.id || 'anonymous',
          userAgent: navigator?.userAgent || 'unknown',
        },
        utente_id: user?.id || null
      };

      const { error } = await supabase
        .from('attivita')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Error in audit logger:', error);
    }
  }
};

// Security monitoring helpers
export const securityMonitor = {
  // Monitor failed login attempts
  trackFailedLogin: async (email: string) => {
    await auditLogger.auth('failed_login', { email, timestamp: new Date().toISOString() });
  },

  // Monitor data export attempts
  trackDataExport: async (table: string, recordCount: number) => {
    await auditLogger.dataAccess('read', table, { 
      type: 'export', 
      recordCount,
      timestamp: new Date().toISOString() 
    });
  },

  // Monitor bulk operations
  trackBulkOperation: async (operation: string, table: string, recordCount: number) => {
    await auditLogger.dataAccess('update', table, { 
      type: 'bulk_operation',
      operation,
      recordCount,
      timestamp: new Date().toISOString() 
    });
  },

  // Monitor sensitive data access
  trackSensitiveAccess: async (resource: string, details?: Record<string, any>) => {
    await auditLogger.security('sensitive_data_access', { 
      resource,
      ...details,
      timestamp: new Date().toISOString() 
    });
  }
};