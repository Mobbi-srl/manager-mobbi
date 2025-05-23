
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const usePartnerAreaAssociation = (partnerId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const associatePartnerWithArea = useCallback(async (areaId: string) => {
    if (!partnerId) return false;
    
    try {
      setIsLoading(true);
      console.log(`Associando partner ${partnerId} all'area ${areaId}...`);
      
      // Prima aggiorna il campo area_id nella tabella partner
      const { error: updateError } = await supabase
        .from('partner')
        .update({ area_id: areaId })
        .eq('id', partnerId);
      
      if (updateError) {
        console.error("Errore nell'aggiornamento del partner:", updateError);
        toast.error("Errore nell'associazione dell'area al partner");
        return false;
      }
      
      // Poi assicuriamo anche la relazione nella tabella area_partner per backward compatibility
      // Prima rimuoviamo eventuali relazioni esistenti
      await supabase
        .from('area_partner')
        .delete()
        .eq('partner_id', partnerId);
      
      // Poi inseriamo la nuova relazione
      const { error: insertError } = await supabase
        .from('area_partner')
        .insert([{ 
          partner_id: partnerId, 
          area_id: areaId 
        }]);
      
      if (insertError) {
        console.error("Errore nell'inserimento della relazione area-partner:", insertError);
        toast.error("Errore nella creazione della relazione area-partner");
        return false;
      }
      
      toast.success("Partner associato all'area con successo");
      
      // Invalida le query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      queryClient.invalidateQueries({ queryKey: ["partner"] });
      
      return true;
    } catch (error) {
      console.error("Errore nell'associazione del partner all'area:", error);
      toast.error("Errore nell'associazione del partner all'area");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [partnerId, queryClient]);
  
  const getPartnerArea = useCallback(async () => {
    if (!partnerId) return null;
    
    try {
      const { data, error } = await supabase
        .from('partner')
        .select('area_id')
        .eq('id', partnerId)
        .single();
      
      if (error) {
        console.error("Errore nel recupero dell'area del partner:", error);
        return null;
      }
      
      return data.area_id;
    } catch (error) {
      console.error("Errore nel recupero dell'area del partner:", error);
      return null;
    }
  }, [partnerId]);

  return {
    isLoading,
    associatePartnerWithArea,
    getPartnerArea
  };
};
