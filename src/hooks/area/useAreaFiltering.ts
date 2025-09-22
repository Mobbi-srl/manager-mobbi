import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Area } from "./types";
import { toast } from "sonner";

// Hook to fetch areas based on user role and ID
export const useAreaFiltering = (isGestore: boolean, userId?: string) => {
  return useQuery({
    queryKey: ["filtered_areas", isGestore, userId],
    queryFn: async () => {
      console.log(`🔍 useAreaFiltering: Fetching areas. isGestore: ${isGestore}, userId: ${userId}`);

      if (!userId) {
        console.warn("⚠️ useAreaFiltering: userId is undefined, returning empty array.");
        return [];
      }

      try {
        // 1) Prova sempre a prendere le aree assegnate via RLS (utente_area)
        const { data: userAreas, error: userAreasError } = await supabase
          .from("utente_area")
          .select("area:area_id(*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione)))");

        if (userAreasError) {
          console.error("❌ useAreaFiltering: Error fetching user-specific areas:", userAreasError);
        }

        const areasFromAssignments = (userAreas || []).map(ua => ua.area).filter(Boolean) as Area[];
        if (areasFromAssignments.length > 0) {
          console.log(`✅ useAreaFiltering: Fetched ${areasFromAssignments.length} areas via utente_area (RLS)`);
          return areasFromAssignments;
        }

        // 2) Fallback: aree disponibili (visibili solo se le policy lo consentono)
        // Rimuovi il filtro sullo stato per permettere ai gestori di vedere anche aree non attive
        const { data: allAreas, error: allAreasError } = await supabase
          .from("aree_geografiche")
          .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione))")
          .order("nome");

        if (allAreasError) {
          console.error("❌ useAreaFiltering: Error fetching all available areas:", allAreasError);
          toast.error("Errore nel recupero delle aree disponibili");
          throw allAreasError;
        }

        console.log(`ℹ️ useAreaFiltering: Fallback fetched ${allAreas?.length || 0} areas from aree_geografiche`);
        return (allAreas || []) as Area[];
      } catch (error: any) {
        console.error("❌ useAreaFiltering: Unhandled error:", error);
        toast.error(`Errore nel recupero delle aree: ${error.message}`);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30000, // Cache data for 30 seconds
  });
};
