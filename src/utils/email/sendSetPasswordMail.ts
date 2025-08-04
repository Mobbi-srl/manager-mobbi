
import { toast } from "sonner";
import { SUPABASE_CONFIG } from "@/config/supabase";

// Send password setup email with edge function
export const sendSetPasswordMail = async (email: string) => {
  try {
    console.log("Calling edge function send-set-password-link for:", email);

    const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/send-set-password-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'apikey': SUPABASE_CONFIG.anonKey
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error response from edge function:", response.status, data);
      throw new Error(data.error || data.message || "Errore nell'invio dell'email");
    }

    console.log("Edge function response:", data);
    return data;
  } catch (error: any) {
    console.error("Error sending email:", error);
    toast.error(`Errore nell'invio dell'email di setup: ${error.message || "Errore sconosciuto"}`);
    throw error;
  }
};
