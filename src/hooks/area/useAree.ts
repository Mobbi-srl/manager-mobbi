
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Area } from "./types";

/**
 * Hook per ottenere tutte le aree geografiche
 */
export const useAree = () => {
  console.log("🔍 useAree: Starting to fetch areas");
  const { data: aree, isLoading, error, refetch } = useQuery({
    queryKey: ["aree_geografiche"],
    queryFn: async () => {
      console.log("🔍 useAree: QueryFn started - fetching basic area information");
      // 1. Get basic area information
      const { data: aree, error } = await supabase
        .from("aree_geografiche")
        .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome))");
      
      if (error) {
        console.error("❌ useAree: Error fetching basic area information:", error);
        throw error;
      }
      
      console.log(`🔍 useAree: Successfully retrieved ${aree?.length || 0} areas`);
      
      // 2. First, let's get a map of all partners per area to use for calculations
      console.log("🔍 useAree: Starting to fetch partner details for each area");
      const areasWithDetails = await Promise.all((aree || []).map(async (area) => {
        try {
          console.log(`🔍 useAree: Processing area ${area.nome} (${area.id})`);
          // Get a list of all partners directly related to this area
          const { data: areaPartners, error: errAreaPartners } = await supabase
            .from("area_partner")
            .select("partner_id")
            .eq("area_id", area.id);
          
          if (errAreaPartners) {
            console.error(`❌ useAree: Error fetching partners for area ${area.nome}:`, errAreaPartners);
            return { ...area, partnerIds: [] };
          }
          
          // Extract partner IDs to use for subsequent queries
          const partnerIds = areaPartners?.map(ap => ap.partner_id) || [];
          console.log(`🔍 useAree: Found ${partnerIds.length} partners for area ${area.nome}`);
          
          return { ...area, partnerIds };
        } catch (err) {
          console.error(`❌ useAree: Error processing area ${area.nome}:`, err);
          return { ...area, partnerIds: [] };
        }
      }));
      
      console.log("🔍 useAree: Starting detailed calculations for each area");
      // 3. Now perform the detailed calculations for each area
      const completedAreas = await Promise.all(areasWithDetails.map(async (area) => {
        console.log(`🔍 useAree: Calculating statistics for area ${area.nome}`);
        const partnerIds = area.partnerIds || [];
        let stazioni_richieste = 0;
        let assegnate = 0;
        
        // If we have partners in this area, get their requested stations
        if (partnerIds.length > 0) {
          console.log(`🔍 useAree: Fetching complete partner data for ${area.nome} to calculate requested stations`);
          // First get the complete partner data for the calculation
          const { data: partners, error: errPartners } = await supabase
            .from("partner")
            .select("richiesta_stazioni")
            .in("id", partnerIds);
            
          if (errPartners) {
            console.error(`❌ useAree: Error fetching partners for ${area.nome}:`, errPartners);
          } else if (partners && partners.length > 0) {
            console.log(`🔍 useAree: Found ${partners.length} partners with data for ${area.nome}, calculating requested stations`);
            // Sum requested stations from all partners
            for (const partner of partners) {
              if (partner.richiesta_stazioni && Array.isArray(partner.richiesta_stazioni)) {
                console.log(`🔍 useAree: Processing richiesta_stazioni for partner:`, partner.richiesta_stazioni);
                partner.richiesta_stazioni.forEach((stazione: any) => {
                  const quantity = parseInt(stazione.quantity || 0, 10);
                  if (!isNaN(quantity)) {
                    console.log(`🔍 useAree: Adding ${quantity} stations to request count for area ${area.nome}`);
                    stazioni_richieste += quantity;
                  }
                });
              } else {
                console.log(`🔍 useAree: Partner has no richiesta_stazioni or invalid format`, partner);
              }
            }
          } else {
            console.log(`🔍 useAree: No partners found with data for ${area.nome}`);
          }
          
          console.log(`🔍 useAree: Counting assigned stations for ${area.nome}`);
          // Count assigned stations
          const { count, error: errAssegnate } = await supabase
            .from("installazioni")
            .select("*", { count: "exact" })
            .in("partner_id", partnerIds);
            
          if (errAssegnate) {
            console.error(`❌ useAree: Error counting assigned stations for ${area.nome}:`, errAssegnate);
          }
          assegnate = count || 0;
        } else {
          console.log(`🔍 useAree: No partners for area ${area.nome}, skipping station calculations`);
        }
        
        // Transform capoluoghi data
        const capoluoghi = Array.isArray(area.aree_capoluoghi) 
          ? area.aree_capoluoghi.map((rel: any) => rel.capoluoghi).filter(Boolean)
          : [];

        // Get the partner count directly from the junction table
        console.log(`🔍 useAree: Counting total partners for ${area.nome}`);
        const { count: partnerCount, error: errPartnerCount } = await supabase
          .from("area_partner")
          .select("*", { count: "exact" })
          .eq("area_id", area.id);
        
        if (errPartnerCount) {
          console.error(`❌ useAree: Error counting partners for ${area.nome}:`, errPartnerCount);
        }
        
        // Update area status based on partners
        let areaStato = area.stato;
        
        // If the area has partners, ensure it's "attiva"
        if (partnerCount && partnerCount > 0) {
          areaStato = "attiva";
        } 
        // If no partners and not explicitly set to "inattiva", set to "In attivazione"
        else if (area.stato !== "inattiva") {
          areaStato = "In attivazione";
        }
        
        // Special case for areas like "Riviera Romagnola" or "Roma" that should always be active
        if (area.nome === "Roma" || area.nome.includes("Roma")) {
          areaStato = "attiva";
        }
        
        console.log(`✅ useAree: Area ${area.nome}: ${stazioni_richieste} requested stations, ${assegnate} assigned stations, ${partnerCount} partners`);
        
        // Return the area with added information
        return {
          ...area,
          capoluoghi,
          stato: areaStato,
          stazioni_richieste: stazioni_richieste || 0,
          stazioni_assegnate: assegnate || 0,
          partner_count: partnerCount || 0
        };
      }));
      
      console.log(`✅ useAree: Completed processing all ${completedAreas.length} areas`);
      return completedAreas as Area[];
    },
  });

  return {
    aree: aree || [],
    isLoading,
    error,
    refetch // Expose refetch to allow manual data refresh
  };
};
