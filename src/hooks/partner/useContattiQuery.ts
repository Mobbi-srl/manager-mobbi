
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../auth";
import { useUserAreas } from "../users/useUserAreas";

export const useContattiQuery = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.ruolo;
  const isGestore = userRole === "Gestore";
  
  // Get user areas if the user is a Gestore
  const { data: userAreas } = useUserAreas(isGestore ? user?.id : undefined);

  return useQuery({
    queryKey: ["contatti", userRole, user?.id],
    queryFn: async () => {
      console.log("🔍 Fetching contatti with user role:", userRole);
      
      // Build the query to include all necessary partner fields
      let query = supabase
        .from("contatti")
        .select(`
          id,
          nome,
          cognome,
          ruolo,
          email,
          numero,
          partner:partner_id (
            id,
            ragione_sociale,
            nome_locale,
            stato,
            area_id,
            segnalato_da,
            ranking,
            ranking_confirmed,
            richiesta_stazioni,
            stazioni_allocate,
            indirizzo_operativa,
            citta_operativa,
            provincia_operativa,
            regione_operativa,
            cap_operativa,
            nazione_operativa,
            indirizzo_legale,
            citta_legale,
            provincia_legale,
            regione_legale,
            cap_legale,
            nazione_legale,
            area:area_id (
              id,
              nome,
              regione
            )
          )
        `)
        .not("partner_id", "is", null);

      // Apply filtering based on user role
      if (isGestore && userAreas && userAreas.length > 0) {
        const areaIds = userAreas.map(area => area.id);
        console.log("🎯 Gestore filtering by areas:", areaIds);
        
        // Filter partners by area_id
        query = query.filter("partner.area_id", "in", `(${areaIds.join(",")})`);
      } else if (isGestore && userAreas && userAreas.length === 0) {
        console.log("⚠️ Gestore has no assigned areas, returning empty result");
        return [];
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error fetching contatti:", error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} contatti`);
      console.log("📊 Sample partner data:", data?.[0]?.partner);
      return data || [];
    },
    enabled: !isGestore || (isGestore && !!userAreas),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
