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
        if (isGestore) {
          // Fetch areas associated with the user
          const { data: userAreas, error: userAreasError } = await supabase
            .from("utente_area")
            .select("area:area_id(*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione)))")
            .eq("utente_id", userId);

          if (userAreasError) {
            console.error("❌ useAreaFiltering: Error fetching user-specific areas:", userAreasError);
            toast.error("Errore nel recupero delle aree utente");
            throw userAreasError;
          }

          const areas = userAreas.map(ua => ua.area).filter(Boolean) as Area[];
          console.log(`✅ useAreaFiltering: Successfully fetched ${areas.length} user-specific areas`);
          return areas;
        } else {
          // Fetch all available areas
          const { data: allAreas, error: allAreasError } = await supabase
            .from("aree_geografiche")
            .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione))")
            .order("nome");

          if (allAreasError) {
            console.error("❌ useAreaFiltering: Error fetching all available areas:", allAreasError);
            toast.error("Errore nel recupero delle aree disponibili");
            throw allAreasError;
          }

          console.log(`✅ useAreaFiltering: Successfully fetched ${allAreas?.length || 0} available areas`);
          return allAreas as Area[];
        }
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
