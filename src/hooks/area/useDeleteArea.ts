
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook per eliminare un'area geografica
 */
export const useDeleteArea = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Prima ottieni i dettagli dell'area per il log
        const { data: areaCorrente } = await supabase
          .from("aree_geografiche")
          .select("nome")
          .eq("id", id)
          .single();
        
        if (!areaCorrente) throw new Error("Area non trovata");
        
        // Elimina le relazioni con i capoluoghi
        const { error: relError } = await supabase
          .from("aree_capoluoghi")
          .delete()
          .eq("area_id", id);
        
        if (relError) throw relError;
        
        // Elimina l'area geografica
        const { error } = await supabase
          .from("aree_geografiche")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        
        // Registra attività di eliminazione
        await supabase.from("attivita").insert({
          tipo: "area_eliminata",
          descrizione: `Area "${areaCorrente.nome}" eliminata`,
          dati: { area_id: id, area_nome: areaCorrente.nome },
          utente_id: user?.id,
        });
        
        // Notifica a gestori/master/superadmin
        const { data: utenti } = await supabase
          .from("anagrafica_utenti")
          .select("id, ruolo")
          .in("ruolo", ["Gestore", "Master", "SuperAdmin"]);
        
        if (utenti && utenti.length > 0) {
          const notifiche = utenti.map((utente) => ({
            utente_id: utente.id,
            titolo: "Area eliminata",
            messaggio: `L'area "${areaCorrente.nome}" è stata eliminata`,
            tipo: "area_eliminata",
          }));
          
          await supabase.from("notifiche").insert(notifiche);
        }
        
        return { success: true };
      } catch (error) {
        console.error("Errore durante l'eliminazione dell'area:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aree_geografiche"] });
      toast.success("Area eliminata con successo");
      queryClient.invalidateQueries({ queryKey: ["attivita"] });
      queryClient.invalidateQueries({ queryKey: ["notifiche"] });
    },
    onError: (error) => {
      console.error("Errore eliminazione area:", error);
      toast.error("Errore durante l'eliminazione dell'area");
    },
  });
};
