
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Area } from "@/hooks/area/types";
import { toast } from "sonner";

// Hook per ottenere tutte le aree disponibili
export const useFetchAvailableAreas = () => {
  return useQuery({
    queryKey: ["available_areas"],
    queryFn: async () => {
      console.log("🔍 useFetchAvailableAreas: Fetching all available areas");
      const { data: areas, error } = await supabase
        .from("aree_geografiche")
        .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione))")
        .order("nome");

      if (error) {
        console.error("❌ useFetchAvailableAreas: Error fetching available areas:", error);
        toast.error("Errore nel recupero delle aree disponibili");
        throw error;
      }

      console.log(`✅ useFetchAvailableAreas: Successfully fetched ${areas?.length || 0} available areas`);
      
      // Formattazione delle aree con informazioni sui capoluoghi
      return (areas || []).map(area => {
        const capoluoghi = Array.isArray(area.aree_capoluoghi) 
          ? area.aree_capoluoghi.map((rel: any) => rel.capoluoghi).filter(Boolean)
          : [];
        
        return {
          ...area,
          capoluoghi,
          displayName: `${area.nome} - ${area.regione}${capoluoghi[0]?.nome ? ` - ${capoluoghi[0]?.nome}` : ''}`
        };
      }) as (Area & { displayName: string })[];
    },
    staleTime: 30000, // Cache data for 30 seconds
  });
};
