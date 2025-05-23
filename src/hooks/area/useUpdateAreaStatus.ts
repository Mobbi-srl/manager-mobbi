
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook per aggiornare lo stato di un'area
 */
export const useUpdateAreaStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, stato }: { id: string, stato: string }) => {
      try {
        const { error } = await supabase
          .from("aree_geografiche")
          .update({ stato })
          .eq("id", id);
        
        if (error) throw error;
        
        // Ottiene l'area corrente per il log
        const { data: areaCorrente } = await supabase
          .from("aree_geografiche")
          .select("nome")
          .eq("id", id)
          .single();
          
        if (!areaCorrente) throw new Error("Area non trovata");
        
        // Registra attività
        await supabase.from("attivita").insert({
          tipo: "area_stato_modificato",
          descrizione: `Stato area "${areaCorrente.nome}" cambiato a "${stato}"`,
          dati: { area_id: id, stato, area_nome: areaCorrente.nome },
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
            titolo: "Cambio stato area",
            messaggio: `L'area "${areaCorrente.nome}" è ora "${stato}"`,
            tipo: "area_stato_modificato",
          }));
          
          await supabase.from("notifiche").insert(notifiche);
        }
        
        return { success: true };
      } catch (error) {
        console.error("Errore durante l'aggiornamento dello stato:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aree_geografiche"] });
      toast.success("Stato area aggiornato");
      queryClient.invalidateQueries({ queryKey: ["attivita"] });
      queryClient.invalidateQueries({ queryKey: ["notifiche"] });
    },
    onError: (error) => {
      console.error("Errore aggiornamento stato:", error);
      toast.error("Errore aggiornamento stato area");
    },
  });
};
