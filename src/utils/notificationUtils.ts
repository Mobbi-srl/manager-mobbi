
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const markNotificationAsRead = async (id: string) => {
  try {
    const { error } = await supabase
      .from("notifiche")
      .update({ letta: true })
      .eq("id", id);
    
    if (error) throw error;
    return id;
  } catch (error) {
    console.error("Errore durante l'aggiornamento della notifica:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string, role: string) => {
  try {
    let query = supabase
      .from("notifiche")
      .update({ letta: true });
    
    if (role !== "SuperAdmin") {
      query = query.eq("utente_id", userId);
    }
    
    const { error } = await query.eq("letta", false);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Errore durante l'aggiornamento delle notifiche:", error);
    throw error;
  }
};

export const formatNotificationDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
