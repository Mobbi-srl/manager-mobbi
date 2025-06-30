
import { toast } from "sonner";

// Send password setup email with edge function
export const sendSetPasswordMail = async (email: string) => {
  try {
    console.log("Calling edge function send-set-password-link for:", email);

    // Fix: Add authorization header with Supabase anon key
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Y3dhcmVxZHJraHBhcmdmcGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODU5MTIsImV4cCI6MjA2Njg2MTkxMn0.c_brMTrwYgIrBOvkbC3M4BrR9CpQ2GJNdETOQVH_rZI";
    
    const response = await fetch('https://mtcwareqdrkhpargfphu.functions.supabase.co/send-set-password-link', {
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
