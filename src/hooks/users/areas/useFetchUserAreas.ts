
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Area } from "@/hooks/area/types";
import { toast } from "sonner";

// Hook per ottenere le aree associate a un utente
export const useFetchUserAreas = (userId?: string) => {
  return useQuery({
    queryKey: ["user_areas", userId],
    queryFn: async () => {
      console.log("🔍 useFetchUserAreas: Fetching areas for user", userId);
      if (!userId) return [];

      try {
        // 1) Tenta sempre prima via utente_area (RLS filtra automaticamente per l'utente corrente)
        const areasFromAssignments = await fetchAreasForUser(userId);
        if (areasFromAssignments.length > 0) {
          return areasFromAssignments;
        }

        // 2) Fallback: tutte le aree (solo ruoli privilegiati vedranno risultati per via delle RLS)
        return await fetchAllAreas();
      } catch (error) {
        console.error("❌ useFetchUserAreas: Unhandled error:", error);
        toast.error("Errore nel recupero delle aree assegnate");
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30000, // Cache data for 30 seconds
  });
};

// Funzione helper per ottenere tutte le aree
async function fetchAllAreas(): Promise<Area[]> {
  // Rimuovi filtri di stato per permettere ai gestori di vedere tutte le loro aree assegnate
  const { data: allAreas, error: allAreasError } = await supabase
    .from("aree_geografiche")
    .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione))")
    .order("nome");
    
  if (allAreasError) {
    console.error("❌ useFetchUserAreas: Error fetching all areas:", allAreasError);
    throw allAreasError;
  }
  
  console.log(`✅ useFetchUserAreas: Successfully fetched ${allAreas?.length || 0} areas`);
  return allAreas as Area[];
}

// Funzione helper per ottenere le aree di un utente specifico
async function fetchAreasForUser(userId: string): Promise<Area[]> {
  console.log(`ℹ️ useFetchUserAreas: Fetching associated areas for user ${userId}`);
  
  // Query ottimizzata che ottiene direttamente le aree associate all'utente
  const { data: userAreas, error: directError } = await supabase
    .from("utente_area")
    .select("area:area_id(*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione)))");

  if (directError) {
    console.error("❌ useFetchUserAreas: Error fetching user-area direct relationships:", directError);
    
    // Fallback alla vista in caso di problemi
    console.log("ℹ️ useFetchUserAreas: Trying fallback with view...");
    return fetchAreasViaView(userId);
  }

  if (!userAreas || userAreas.length === 0) {
    console.log("⚠️ useFetchUserAreas: No direct area associations found for user, trying view...");
    return fetchAreasViaView(userId);
  }

  // Trasforma i risultati nel formato atteso
  const areas = userAreas
    .map(ua => ua.area)
    .filter(Boolean);
  
  console.log(`✅ useFetchUserAreas: Successfully fetched ${areas.length} areas for user ${userId} via direct relationship:`, areas);
  return areas as Area[];
}

// Funzione di supporto per ottenere le aree usando la vista
async function fetchAreasViaView(userId: string): Promise<Area[]> {
  console.log("🔍 useFetchUserAreas: Fetching areas using view for user", userId);
  
  // Ottieni le associazioni utente-area usando la vista
  const { data: userAreaView, error: viewError } = await supabase
    .from("vw_utenti_aree")
    .select("area_id")
    .eq("utente_id", userId)
    .not("area_id", "is", null);

  if (viewError) {
    console.error("❌ useFetchUserAreas: Error fetching from view:", viewError);
    throw viewError;
  }

  console.log(`✅ useFetchUserAreas: Found ${userAreaView?.length || 0} area associations for user ${userId} from view`, userAreaView);
  
  if (!userAreaView || userAreaView.length === 0) {
    console.log("ℹ️ useFetchUserAreas: No areas assigned to this user via view");
    return [];
  }

  // Ottieni i dettagli completi delle aree
  const areaIds = userAreaView.map(ua => ua.area_id).filter(Boolean);
  console.log("🔍 useFetchUserAreas: Fetching area details for IDs via view:", areaIds);
  
  if (areaIds.length === 0) {
    return [];
  }
  
  const { data: areas, error: areasError } = await supabase
    .from("aree_geografiche")
    .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome, regione))")
    .in("id", areaIds);

  if (areasError) {
    console.error("❌ useFetchUserAreas: Error fetching area details via view:", areasError);
    throw areasError;
  }

  console.log(`✅ useFetchUserAreas: Successfully fetched ${areas?.length || 0} areas for user ${userId} via view`, areas);
  return areas as Area[];
}
