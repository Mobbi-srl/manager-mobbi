
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StazioneData {
  id?: string;
  modello: string;
  colore: string;
  numero_seriale: string;
  documento_allegato?: string;
  partner_id: string;
  stato_stazione: 'ATTIVA' | 'IN MANUTENZIONE' | 'DISMESSA';
  attiva: boolean;
}

export const usePartnerStazioni = (partnerId?: string) => {
  const queryClient = useQueryClient();
  const [isActivating, setIsActivating] = useState(false);

  // Fetch stazioni esistenti per il partner
  const { data: stazioni, isLoading } = useQuery({
    queryKey: ["partner-stazioni", partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      
      const { data, error } = await supabase
        .from("stazioni")
        .select("*")
        .eq("partner_id", partnerId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!partnerId,
  });

  // Salva o aggiorna una stazione
  const saveStazioneMutation = useMutation({
    mutationFn: async (stazioneData: StazioneData) => {
      console.log("💾 Saving stazione data:", stazioneData);
      
      if (stazioneData.id) {
        // Update esistente
        const { data, error } = await supabase
          .from("stazioni")
          .update({
            numero_seriale: stazioneData.numero_seriale,
            documento_allegato: stazioneData.documento_allegato,
            stato_stazione: stazioneData.stato_stazione,
            attiva: stazioneData.attiva
          })
          .eq("id", stazioneData.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert nuovo
        const { data, error } = await supabase
          .from("stazioni")
          .insert({
            modello: stazioneData.modello,
            colore: stazioneData.colore,
            numero_seriale: stazioneData.numero_seriale,
            documento_allegato: stazioneData.documento_allegato,
            partner_id: stazioneData.partner_id,
            stato_stazione: stazioneData.stato_stazione,
            attiva: stazioneData.attiva
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-stazioni", partnerId] });
    },
  });

  // Attiva partner (cambia stato a ATTIVO)
  const attivaPartnerMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      console.log("🚀 Activating partner:", partnerId);
      
      const { data, error } = await supabase
        .from("partner")
        .update({ stato: "ATTIVO" })
        .eq("id", partnerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      toast.success("Partner attivato con successo!");
      setIsActivating(false);
    },
    onError: (error: any) => {
      console.error("❌ Error activating partner:", error);
      toast.error("Errore durante l'attivazione del partner");
      setIsActivating(false);
    },
  });

  const salvaStazione = async (stazioneData: StazioneData): Promise<void> => {
    await saveStazioneMutation.mutateAsync(stazioneData);
  };

  const attivaPartner = async (partnerId: string) => {
    setIsActivating(true);
    return attivaPartnerMutation.mutateAsync(partnerId);
  };

  return {
    stazioni: stazioni || [],
    isLoading,
    salvaStazione,
    attivaPartner,
    isActivating,
    isSaving: saveStazioneMutation.isPending,
  };
};
