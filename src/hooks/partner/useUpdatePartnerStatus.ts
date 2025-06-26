
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PartnerStatus = "CONTATTO" | "APPROVATO" | "SELEZIONATO" | "ALLOCATO" | "CONTRATTUALIZZATO" | "PERSO" | "ATTIVO";

export const useUpdatePartnerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partnerId, newStatus }: { partnerId: string; newStatus: PartnerStatus }) => {
      console.log(`🔄 Updating partner ${partnerId} status to ${newStatus}`);
      
      const { error } = await supabase
        .from("partner")
        .update({ stato: newStatus })
        .eq("id", partnerId);

      if (error) {
        console.error("❌ Error updating partner status:", error);
        throw error;
      }

      console.log(`✅ Partner ${partnerId} status updated to ${newStatus}`);
      return { partnerId, newStatus };
    },
    onSuccess: (data) => {
      const statusMessages: Record<PartnerStatus, string> = {
        'CONTATTO': 'Partner riportato allo stato di contatto',
        'APPROVATO': 'Partner approvato',
        'SELEZIONATO': 'Partner selezionato',
        'ALLOCATO': 'Partner allocato',
        'CONTRATTUALIZZATO': 'Partner contrattualizzato',
        'PERSO': 'Partner contrassegnato come perso',
        'ATTIVO': 'Partner attivato'
      };
      
      toast.success(statusMessages[data.newStatus] || 'Stato partner aggiornato');
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      queryClient.invalidateQueries({ queryKey: ["partner"] });
    },
    onError: (error: any) => {
      console.error("❌ Failed to update partner status:", error);
      toast.error(`Errore nell'aggiornamento dello stato: ${error.message || "Errore sconosciuto"}`);
    }
  });
};
