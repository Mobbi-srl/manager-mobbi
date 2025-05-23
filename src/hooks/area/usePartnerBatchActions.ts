
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { StatoPartner } from "@/hooks/partner/types";

export const usePartnerBatchActions = (areaId: string) => {
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const togglePartnerSelection = (id: string, statoPartner: string) => {
    // Only allow selection of CONTATTO status partners
    if (statoPartner !== StatoPartner.CONTATTO) return;
    
    setSelectedPartnerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (partners: any[]) => {
    if (!partners?.length) return;
    
    // Filter only partners with CONTATTO status
    const selectable = partners.filter((p) => p.stato === StatoPartner.CONTATTO);
    
    const allSelected = selectable.length > 0 && 
      selectable.every((p) => selectedPartnerIds.includes(p.id));

    if (allSelected) {
      setSelectedPartnerIds((prev) =>
        prev.filter((id) => !selectable.some((p) => p.id === id))
      );
    } else {
      const selectableIds = selectable.map((p) => p.id);
      setSelectedPartnerIds((prev) => [
        ...prev,
        ...selectableIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleBatchAction = async () => {
    if (selectedPartnerIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("partner")
        .update({ stato: "APPROVATO" })
        .in("id", selectedPartnerIds);

      if (error) {
        console.error("❌ Errore aggiornamento stato:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Errore durante l'aggiornamento dei partner.",
        });
        return;
      }

      toast({
        variant: "default", // Changed from "success" to "default"
        title: "Successo",
        description: "✅ Partner aggiornati correttamente!",
      });
      setSelectedPartnerIds([]);
      
      // Refresh data after updating
      queryClient.invalidateQueries({ queryKey: ["area_partners", areaId] });

    } catch (err) {
      console.error("❌ Errore inaspettato:", err);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore imprevisto durante l'aggiornamento.",
      });
    }
  };

  const calculateAllSelectableChecked = (partners: any[]) => {
    if (!partners?.length) return false;
    
    // Only count partners with CONTATTO status
    const selectable = partners.filter((p) => p.stato === StatoPartner.CONTATTO);
    if (selectable.length === 0) return false;
    
    return selectable.every((p) => selectedPartnerIds.includes(p.id));
  };

  return {
    selectedPartnerIds,
    togglePartnerSelection,
    toggleSelectAll,
    handleBatchAction,
    calculateAllSelectableChecked
  };
};
