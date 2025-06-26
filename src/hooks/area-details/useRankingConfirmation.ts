
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { StatoPartner } from "@/hooks/partner/types";
import { useAuth } from "@/hooks/auth";

export const useRankingConfirmation = (areaId: string) => {
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userRole = user?.user_metadata?.ruolo;
  const isPrivilegedUser = userRole === "SuperAdmin" || userRole === "Master";

  const toggleRankingConfirmation = async (partnerId: string, currentStatus: boolean, newRanking?: number) => {
    console.log(`⚙️ toggleRankingConfirmation: Updating partner ${partnerId} ranking confirmation from ${currentStatus} to ${!currentStatus}`);
    if (newRanking !== undefined) {
      console.log(`⚙️ toggleRankingConfirmation: Also updating ranking value to ${newRanking}`);
    }

    setIsUpdating(prev => ({ ...prev, [partnerId]: true }));

    try {
      // First, get the current partner data to check the status
      const { data: partnerData, error: fetchError } = await supabase
        .from("partner")
        .select('id, stato, ranking')
        .eq("id", partnerId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching partner data:", fetchError);
        toast.error("Errore durante il recupero dei dati del partner");
        return false;
      }

      // Validate that the partner is in the correct state for confirmation
      if (!currentStatus && partnerData.stato !== StatoPartner.APPROVATO) {
        console.error(`❌ Cannot confirm ranking: Partner is in ${partnerData.stato} state, must be ${StatoPartner.APPROVATO}`);
        toast.error(`Solo i partner APPROVATI possono avere la valutazione confermata`);
        return false;
      }

      let updateData: Record<string, any> = {
        ranking_confirmed: !currentStatus,
      };

      // If new ranking value is provided, update it
      // Make sure ranking is always passed as a number or null, never as an empty string or undefined
      if (newRanking !== undefined) {
        // Convert newRanking to a proper number or null if it's not a valid number
        const rankingValue = typeof newRanking === 'string'
          ? (newRanking === '' ? null : parseInt(newRanking, 10))
          : (newRanking === 0 ? null : newRanking);

        console.log(`⚙️ toggleRankingConfirmation: Setting ranking to ${rankingValue} (type: ${typeof rankingValue})`);
        updateData.ranking = rankingValue;
      }

      // Solo SuperAdmin o Master possono aggiornare lo stato a SELEZIONATO
      if (isPrivilegedUser && !currentStatus) {
        // Aggiorna anche lo stato a SELEZIONATO solo per utenti privilegiati
        updateData.stato = StatoPartner.SELEZIONATO;
      }

      console.log("⚙️ Update data being sent:", updateData);

      const { data, error } = await supabase
        .from("partner")
        .update(updateData)
        .eq("id", partnerId)
        .select('id, ranking_confirmed, stato, ranking');

      if (error) {
        console.error("❌ Error updating ranking confirmation status:", error);
        toast.error("Errore durante l'aggiornamento dello stato della valutazione");
        return false;
      }

      console.log(`✅ toggleRankingConfirmation: Successfully updated partner ${partnerId}:`, data);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["area_partners", areaId] });
      queryClient.invalidateQueries({ queryKey: ["area_basic", areaId] });

      const successMessage = !currentStatus
        ? isPrivilegedUser
          ? "✅ Valutazione confermata con successo! Partner promosso a SELEZIONATO"
          : "✅ Valutazione confermata con successo!"
        : "✅ Valutazione rimossa";

      toast.success(successMessage);
      return true;
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      toast.error("Errore imprevisto durante l'operazione");
      return false;
    } finally {
      setIsUpdating(prev => ({ ...prev, [partnerId]: false }));
    }
  };

  return {
    isUpdating,
    toggleRankingConfirmation,
    isPrivilegedUser
  };
};
