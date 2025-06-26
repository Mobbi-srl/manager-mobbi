
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAreasData = () => {
  return useQuery({
    queryKey: ["areas-data"],
    queryFn: async () => {
      console.log("🔍 Fetching areas data with comuni");
      
      const { data, error } = await supabase
        .from("aree_geografiche")
        .select("id, nome, regione, comuni");

      if (error) {
        console.error("❌ Error fetching areas data:", error);
        throw error;
      }

      // Converti in formato Record per facile accesso
      const areasRecord: Record<string, { nome: string; regione: string; comuni?: string[] }> = {};
      data?.forEach(area => {
        areasRecord[area.id] = {
          nome: area.nome,
          regione: area.regione,
          comuni: area.comuni || []
        };
      });

      console.log(`✅ Fetched ${data?.length || 0} areas with comuni data`);
      return areasRecord;
    },
    staleTime: 300000, // 5 minuti
    refetchOnWindowFocus: false,
  });
};
