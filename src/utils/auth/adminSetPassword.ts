
import { toast } from "@/components/ui/sonner";
import { SUPABASE_CONFIG } from "@/config/supabase";

// Set password for user using admin edge function
export const adminSetPassword = async (email: string, password: string) => {
  try {
    console.log("Calling admin-reset-password function for email:", email);

    const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/admin-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'apikey': SUPABASE_CONFIG.anonKey
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
