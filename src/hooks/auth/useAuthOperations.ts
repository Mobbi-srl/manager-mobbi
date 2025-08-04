
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { validateInput } from "@/utils/security/inputValidation";
import { useAuthRateLimit } from "./useAuthRateLimit";
import { usePasswordResetRateLimit } from "./usePasswordResetRateLimit";
import { securityMonitor } from "@/utils/security/auditLogger";

export const useAuthOperations = (redirectToLogin: () => void) => {
  const { toast: toastNotification } = useToast();
  const { checkRateLimit } = useAuthRateLimit();
  const { checkRateLimit: checkPasswordResetRateLimit } = usePasswordResetRateLimit();

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Rate limiting check
      if (!checkRateLimit()) {
        toastNotification({
          title: "Troppi tentativi",
          description: "Hai effettuato troppi tentativi di accesso. Riprova tra 15 minuti.",
          variant: "destructive",
        });
        throw new Error("Rate limit exceeded");
      }

      // Input validation
      const validatedEmail = validateInput.requiredEmail(email);
      
      console.log('Attempting login with:', validatedEmail);
      
      // Log authentication attempt
      try {
        await supabase.rpc('log_auth_event', {
          event_type: 'login_attempt',
          user_email: email,
          success: false,
          details: { timestamp: new Date().toISOString() }
        });
      } catch (e) {
        console.warn('Failed to log auth event:', e);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        
        // Log failed login attempt
        try {
          await supabase.rpc('log_auth_event', {
            event_type: 'login_failed',
            user_email: email,
            success: false,
            details: { error: error.message, timestamp: new Date().toISOString() }
          });
        } catch (e) {
          console.warn('Failed to log auth event:', e);
        }
        
        toastNotification({
          title: "Errore di accesso",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Log successful login
      if (data?.user) {
        try {
          await supabase.rpc('log_auth_event', {
            event_type: 'login_success',
            user_email: email,
            success: true,
            details: { user_id: data.user.id, timestamp: new Date().toISOString() }
          });
        } catch (e) {
          console.warn('Failed to log auth event:', e);
        }
      }
      
      console.log('Login successful:', data?.user?.email);
      toast("Accesso effettuato", {
        description: "Benvenuto nella dashboard",
        position: "bottom-right"
      });
      
      return;
    } catch (error: any) {
      console.error("Errore di login:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      // Rate limiting check for password reset
      if (!checkPasswordResetRateLimit()) {
        const error = new Error("Troppi tentativi di reset password. Riprova tra 1 ora.");
        toastNotification({
          title: "Troppi tentativi",
          description: "Hai effettuato troppi tentativi di reset password. Riprova tra 1 ora.",
          variant: "destructive",
        });
        return { error };
      }

      // Input validation
      const validatedEmail = validateInput.requiredEmail(email);
      
      // Log password reset attempt
      await securityMonitor.trackSensitiveAccess('password_reset', {
        email: validatedEmail,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
        redirectTo: window.location.origin + '/nuova-password',
      });

      if (error) {
        // Log failed password reset
        try {
          await supabase.rpc('log_auth_event', {
            event_type: 'password_reset_failed',
            user_email: validatedEmail,
            success: false,
            details: { error: error.message, timestamp: new Date().toISOString() }
          });
        } catch (e) {
          console.warn('Failed to log password reset event:', e);
        }
      } else {
        // Log successful password reset request
        try {
          await supabase.rpc('log_auth_event', {
            event_type: 'password_reset_request',
            user_email: validatedEmail,
            success: true,
            details: { timestamp: new Date().toISOString() }
          });
        } catch (e) {
          console.warn('Failed to log password reset event:', e);
        }
      }

      return { error };
    } catch (error) {
      console.error("Errore durante il reset della password:", error);
      return { error: error as Error };
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('Attempting to sign out');
    
    try {
      // Effettua il signOut
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Logout error:', error.message);
        
        // Anche in caso di errore legato alla sessione mancante, facciamo il redirect
        if (error.message.includes('Auth session missing') || error.message.includes('JWT expired')) {
          console.log('Session already invalid, redirecting to login');
          toast.success("Logout effettuato", {
            description: "Sessione già terminata, reindirizzamento alla pagina di login",
            position: "bottom-right"
          });
          
          // Aspetta che il toast sia visualizzato prima di eseguire il redirect
          setTimeout(() => {
            // Svuota qualsiasi dato di sessione residuo nel localStorage
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('supabase.auth.expires_at');
            
            redirectToLogin();
          }, 1000);
          return;
        }
        
        toast.error("Errore durante il logout", {
          description: error.message,
          position: "bottom-right"
        });
      } else {
        console.log('Logout successful');
        toast.success("Logout effettuato", {
          description: "Hai effettuato il logout con successo",
          position: "bottom-right"
        });
        
        // Assicuriamoci che il redirect avvenga dopo il toast
        setTimeout(() => {
          redirectToLogin();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Errore durante il logout:", error);
      
      // In caso di qualsiasi errore imprevisto, facciamo comunque il redirect
      toast.error("Errore durante il logout", {
        description: error?.message || "Si è verificato un errore",
        position: "bottom-right"
      });
      
      // Assicuriamoci che il redirect avvenga dopo il toast
      setTimeout(() => {
        redirectToLogin();
      }, 1000);
    }
  };

  return {
    signIn,
    resetPassword,
    signOut
  };
};
