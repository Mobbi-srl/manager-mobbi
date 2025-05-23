
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

export const registerUserActivity = async (
  action: "creato" | "aggiornato",
  userData: any,
  queryClient: QueryClient
) => {
  try {
    await supabase.from("attivita").insert({
      tipo: action === "creato" ? "utente_nuovo" : "utente_aggiornato",
      descrizione: `Utente ${userData.nome} ${userData.cognome} ${action}`,
      dati: { utente: userData },
    });
    queryClient.invalidateQueries({ queryKey: ["attivita"] });
  } catch (error) {
    console.error(`Error registering user activity ${action}:`, error);
  }
};

export const sendUserNotifications = async (
  action: "creato" | "aggiornato",
  userData: any,
  queryClient: QueryClient
) => {
  try {
    // Get SuperAdmin users
    const { data: admins } = await supabase
      .from("anagrafica_utenti")
      .select("id")
      .eq("ruolo", "SuperAdmin");
    
    if (!admins || admins.length === 0) return;
    
    const notifiche = admins.map((admin) => ({
      titolo: `Utente ${action}`,
      messaggio: `${userData.nome} ${userData.cognome} (${userData.ruolo}) è stato ${action}`,
      utente_id: admin.id,
      tipo: action === "creato" ? "utente_nuovo" : "utente_aggiornato",
    }));
    
    await supabase.from("notifiche").insert(notifiche);
    queryClient.invalidateQueries({ queryKey: ["notifiche"] });
  } catch (error) {
    console.error(`Error sending user notifications ${action}:`, error);
  }
};
