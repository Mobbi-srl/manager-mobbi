
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

export const useAuthOperations = (redirectToLogin: () => void) => {
  const { toast: toastNotification } = useToast();

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        toastNotification({
          title: "Errore di accesso",
          description: error.message,
          variant: "destructive",
        });
        throw error;
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/nuova-password',
      });
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
