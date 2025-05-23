
import { AuthError } from "@supabase/supabase-js";

export type PasswordResetStage = 'email' | 'password';

export interface PasswordResetError extends Error {
  type: 'validation' | 'network' | 'auth' | 'database' | 'rate_limit' | 'timeout';
  details?: string;
}

export function createPasswordResetError(
  message: string, 
  type: PasswordResetError['type'], 
  details?: string
): PasswordResetError {
  return { name: 'PasswordResetError', message, type, details } as PasswordResetError;
}
