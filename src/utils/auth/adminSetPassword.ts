
import { toast } from "@/components/ui/sonner";

// Set password for user using admin edge function
export const adminSetPassword = async (email: string, password: string) => {
  try {
    console.log("Calling admin-reset-password function for email:", email);

    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYnZmcmhlbmZrdWpmeXFtenNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDM0NTMsImV4cCI6MjA2MzU3OTQ1M30.JAYPlcX-9o6niMx0fMIpi8r6Y3iqkhuuTklD_dCWPd4";

    // Fix: Change function name from admin-reset-password to admin-password-reset
    // This must match the exact folder name in supabase/functions
    const response = await fetch('https://mdicjxymnvtecszsvtqz.functions.supabase.co/admin-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error response from admin-password-reset:", response.status, data);

      if (response.status === 404) {
        throw new Error("Utente non trovato. Verifica l'indirizzo email.");
      }

      throw new Error(data.error || "Errore durante l'aggiornamento della password");
    }

    return { success: true, message: data.message || "Password impostata con successo" };
  } catch (error: any) {
    console.error("Error setting password:", error);
    throw error;
  }
};
