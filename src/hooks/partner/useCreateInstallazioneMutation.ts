
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateInstallazioneParams {
  contattoId: string;
  partnerId: string;
  tipoStazioneId: string;
  ranking: number;
}

export const useCreateInstallazioneMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contattoId, partnerId, tipoStazioneId, ranking }: CreateInstallazioneParams) => {
      const { data, error } = await supabase
        .from("installazioni")
        .insert({
          referente_id: contattoId,
          partner_id: partnerId,
          tipologia_stazione_id: tipoStazioneId,
          ranking_partner: ranking
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Partner selezionato con successo!");
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Errore durante la selezione del partner:", error);
      toast.error("Errore durante la selezione del partner");
    },
  });
};
