// Security utilities for input validation and sanitization

export const sanitizeInput = {
  // Sanitize string input to prevent XSS
  string: (input: string | undefined | null): string => {
    if (!input) return '';
    return input
      .trim()
      .replace(/[<>\\"'&]/g, '') // Remove potentially dangerous characters
      .slice(0, 1000); // Limit length
  },

  // Sanitize email
  email: (email: string | undefined | null): string => {
    if (!email) return '';
    const sanitized = email.trim().toLowerCase();
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
      return '';
    }
    return sanitized.slice(0, 254); // RFC limit
  },

  // Sanitize phone number
  phone: (phone: string | undefined | null): string => {
    if (!phone) return '';
    // Keep only digits, spaces, +, -, (, )
    return phone.replace(/[^\d\s+\-()]/g, '').slice(0, 20);
  },

  // Sanitize numeric input
  number: (input: any): number | null => {
    if (input === null || input === undefined || input === '') return null;
    const num = Number(input);
    return isNaN(num) ? null : num;
  },

  // Sanitize boolean
  boolean: (input: any): boolean => {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      return input.toLowerCase() === 'true';
    }
    return Boolean(input);
  }
};

export const validateInput = {
  // Validate required string
  requiredString: (input: string | undefined | null, fieldName: string): string | null => {
    const sanitized = sanitizeInput.string(input);
    if (!sanitized) {
      throw new Error(`${fieldName} è obbligatorio`);
    }
    return sanitized;
  },

  // Validate email
  email: (email: string | undefined | null): string | null => {
    if (!email) return null;
    const sanitized = sanitizeInput.email(email);
    if (!sanitized) {
      throw new Error('Email non valida');
    }
    return sanitized;
  },

  // Validate required email
  requiredEmail: (email: string | undefined | null): string => {
    if (!email) {
      throw new Error('Email è obbligatoria');
    }
    const sanitized = sanitizeInput.email(email);
    if (!sanitized) {
      throw new Error('Email non valida');
    }
    return sanitized;
  },

  // Validate partita IVA
  partitaIva: (piva: string | undefined | null): string | null => {
    if (!piva) return null;
    const sanitized = piva.replace(/\s/g, '');
    if (!/^\d{11}$/.test(sanitized)) {
      throw new Error('Partita IVA deve essere di 11 cifre');
    }
    return sanitized;
  },

  // Validate codice fiscale
  codiceFiscale: (cf: string | undefined | null): string | null => {
    if (!cf) return null;
    const sanitized = cf.toUpperCase().replace(/\s/g, '');
    if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(sanitized)) {
      throw new Error('Codice fiscale non valido');
    }
    return sanitized;
  },

  // Validate coordinates
  coordinates: (lat: any, lng: any): { lat: number; lng: number } | null => {
    const latitude = sanitizeInput.number(lat);
    const longitude = sanitizeInput.number(lng);
    
    if (latitude === null || longitude === null) return null;
    
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitudine deve essere tra -90 e 90');
    }
    
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitudine deve essere tra -180 e 180');
    }
    
    return { lat: latitude, lng: longitude };
  }
};

// Rate limiting helper (for client-side)
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests: number[] = [];
  
  return {
    isAllowed: (): boolean => {
      const now = Date.now();
      // Remove old requests outside the window
      while (requests.length > 0 && requests[0] <= now - windowMs) {
        requests.shift();
      }
      
      if (requests.length >= maxRequests) {
        return false;
      }
      
      requests.push(now);
      return true;
    },
    
    reset: (): void => {
      requests.length = 0;
    }
  };
};
