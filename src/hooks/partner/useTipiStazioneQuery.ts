
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TipoStazione } from "./partnerTypes";

export const useTipiStazioneQuery = () => {
  return useQuery({
    queryKey: ["tipologie_stazioni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modelli_stazione")
        .select("id, nome, tipologia")
        .order("nome");

      if (error) {
        console.error("Error fetching station types:", error);
        throw error;
      }

      // Map to the expected format, using tipologia as the device type
      return data.map(item => ({
        id: item.id,
        nome: `${item.nome} (${item.tipologia})`,
        tipologia: item.tipologia
      })) as (TipoStazione & { tipologia: string })[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
