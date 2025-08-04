
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { createPasswordResetError, PasswordResetError } from "./types";

// Supabase API key
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZmcmhlbmZrdWpmeXFtenNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDM0NTMsImV4cCI6MjA2MzU3OTQ1M30.JAYPlcX-9o6niMx0fMIpi8r6Y3iqkhuuTklD_dCWPd4";

export const useEmailSubmission = () => {
  const handleEmailSubmit = async (email: string) => {
    try {
      if (!email.trim()) {
        throw createPasswordResetError(
          "Email richiesta",
          'validation'
        );
      }

      // Prima verifichiamo se l'email esiste nel database
      const { data: userRecord, error: userError } = await supabase
        .from('anagrafica_utenti')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        console.error("Errore nel controllo email:", userError);
        throw createPasswordResetError(
          "Errore durante la verifica dell'email",
          'database'
        );
      }

      if (!userRecord) {
        throw createPasswordResetError(
          "Email non registrata",
          'database'
        );
      }

      try {
        const response = await fetch('https://xgbvfrhenfkujfyqmzsk.supabase.co/send-set-password-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Errore risposta edge function:", response.status, data);

          // Handle rate limit errors specifically
          if (response.status === 429 ||
            data.code === "over_email_send_rate_limit" ||
            data.error?.includes("Troppe richieste")) {
            throw createPasswordResetError(
              "Troppe richieste di reset password. Attendere qualche minuto e riprovare.",
              'rate_limit',
              data.message
            );
          }

          // Handle timeout errors
          if (response.status === 504 ||
            data.name === "AuthRetryableFetchError" ||
            data.error?.includes("troppo tempo")) {
            throw createPasswordResetError(
              "Il server ha impiegato troppo tempo a rispondere. Riprova tra qualche momento.",
              'timeout',
              data.message
            );
          }

          if (response.status === 404) {
            throw createPasswordResetError(
              "Email non registrata",
              'database',
              data.message
            );
          }

          throw createPasswordResetError(
            data.message || data.error || "Errore durante l'invio dell'email",
            'network'
          );
        }

        toast.success("Email di impostazione password inviata");
      } catch (error) {
        // Handle network errors
        if ((error as Error).name !== 'PasswordResetError') {
          throw createPasswordResetError(
            "Problema di connessione. Verifica la tua connessione internet e riprova.",
            'network',
            (error as Error).message
          );
        }
        throw error;
      }
    } catch (error) {
      console.error("Errore durante l'invio dell'email:", error);

      if ((error as PasswordResetError).type) {
        const resetError = error as PasswordResetError;

        if (resetError.type === 'rate_limit') {
          toast.error(resetError.message, { duration: 8000 });
        } else if (resetError.type === 'timeout') {
          toast.error(resetError.message, { duration: 8000 });
        } else {
          toast.error(resetError.message);
        }
      } else {
        toast.error("Si è verificato un errore. Riprova più tardi.");
      }
      throw error;
    }
  };

  return { handleEmailSubmit };
};
