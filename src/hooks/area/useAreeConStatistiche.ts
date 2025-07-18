import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Area } from "./types";

/**
 * Hook per ottenere tutte le aree geografiche con statistiche aggiornate
 */
export const useAreeConStatistiche = () => {
  console.log("🔍 useAreeConStatistiche: Starting to fetch areas with statistics");

  const { data: aree, isLoading, error, refetch } = useQuery({
    queryKey: ["aree_geografiche_con_statistiche"],
    queryFn: async () => {
      try {
        console.log("🔍 useAreeConStatistiche: Fetching basic area information");
        // 1. Get basic area information
        const { data: aree, error } = await supabase
          .from("aree_geografiche")
          .select("*, aree_capoluoghi(capoluogo_id, capoluoghi(nome))");

        if (error) {
          console.error("❌ useAreeConStatistiche: Error fetching basic area information:", error);
          throw error;
        }

        if (!aree || aree.length === 0) {
          console.log("ℹ️ useAreeConStatistiche: No areas found in database");
          return [];
        }

        console.log(`✅ useAreeConStatistiche: Retrieved ${aree.length} areas, calculating statistics...`);
        console.log("Raw area data:", aree);

        // 2. Process each area to get statistics
        const areasWithStats = await Promise.all((aree || []).map(async (area) => {
          try {
            console.log(`🔍 useAreeConStatistiche: Processing area ${area.nome} (${area.id})`);

            // Get partners for this area from area_partner junction table
            const { data: areaPartners, error: partnerError } = await supabase
              .from("area_partner")
              .select("partner_id")
              .eq("area_id", area.id);

            if (partnerError) {
              console.error(`❌ useAreeConStatistiche: Error fetching partners for area ${area.nome}:`, partnerError);
              return {
                ...area,
                stazioni_richieste: 0,
                stazioni_assegnate: 0,
                partner_count: 0,
                stato: area.stato || "In attivazione"
              };
            }

            const partnerIds = areaPartners?.map(ap => ap.partner_id) || [];
            const partnerCount = partnerIds.length;

            console.log(`🔍 useAreeConStatistiche: Found ${partnerCount} partners for area ${area.nome}`, partnerIds);

            let stazioni_richieste = 0;
            let stazioni_assegnate = 0;

            // If we have partners, calculate statistics
            if (partnerIds.length > 0) {
              // Get detailed partner information to calculate requested and allocated stations
              const { data: partners, error: partnerDataError } = await supabase
                .from("partner")
                .select("id, richiesta_stazioni, stazioni_allocate")
                .in("id", partnerIds);

              if (partnerDataError) {
                console.error(`❌ useAreeConStatistiche: Error fetching detailed partner info for area ${area.nome}:`, partnerDataError);
              }

              if (partners && partners.length > 0) {
                console.log(`🔍 useAreeConStatistiche: Calculating stations for ${partners.length} partners in ${area.nome}`);
                console.log("Partner data:", JSON.stringify(partners, null, 2));

                partners.forEach((partner) => {
                  // Calculate requested stations
                  let richieste: any[] = [];

                  // Handle richiesta_stazioni (string or array)
                  if (typeof partner.richiesta_stazioni === "string") {
                    try {
                      const parsed = JSON.parse(partner.richiesta_stazioni);
                      if (Array.isArray(parsed)) {
                        richieste = parsed;
                      }
                    } catch (e) {
                      console.error(`❌ Errore nel parsing di richiesta_stazioni per partner ${partner.id}:`, e);
                    }
                  } else if (Array.isArray(partner.richiesta_stazioni)) {
                    richieste = partner.richiesta_stazioni;
                  }

                  // Sum requested stations
                  richieste.forEach((stazione) => {
                    const quantity = parseInt(stazione.quantity || "0", 10);
                    if (!isNaN(quantity)) {
                      stazioni_richieste += quantity;
                    }
                  });

                  // Calculate allocated stations from stazioni_allocate
                  let allocate: any[] = [];
                  
                  if (partner.stazioni_allocate) {
                    try {
                      const allocatedData = typeof partner.stazioni_allocate === 'string'
                        ? JSON.parse(partner.stazioni_allocate)
                        : partner.stazioni_allocate;
                        
                      if (Array.isArray(allocatedData)) {
                        allocate = allocatedData;
                      }
                    } catch (e) {
                      console.error(`❌ Error parsing stazioni_allocate for partner ${partner.id}:`, e);
                    }
                  }

                  // Sum allocated stations
                  allocate.forEach((stazione) => {
                    const quantity = parseInt(stazione.quantity || "0", 10);
                    if (!isNaN(quantity)) {
                      stazioni_assegnate += quantity;
                      console.log(`➕ Partner ${partner.id} allocated ${quantity} stations. Running total: ${stazioni_assegnate}`);
                    }
                  });
                });

                console.log(`✅ useAreeConStatistiche: Total requested stations for area ${area.nome}: ${stazioni_richieste}`);
                console.log(`✅ useAreeConStatistiche: Total allocated stations for area ${area.nome}: ${stazioni_assegnate}`);
              } else {
                console.log(`ℹ️ useAreeConStatistiche: Nessun partner trovato per l'area ${area.nome}`);
              }
            }

            // Update area status based on assigned stations
            let areaStato = "In attivazione";

            // FIXED: Only set status to "attiva" if there are assigned stations
            if (stazioni_assegnate > 0) {
              areaStato = "attiva";
            } else if (area.stato === "inattiva") {
              // Keep "inattiva" status if explicitly set
              areaStato = "inattiva";
            } else {
              // Default is "In attivazione" when no stations are assigned
              areaStato = "In attivazione";
            }

            console.log(`✅ ------------ useAreeConStatistiche: Area ${area.nome} statistics - Requested: ${stazioni_richieste}, Allocated: ${stazioni_assegnate}, Partners: ${partnerCount}, Status: ${areaStato}`);

            // Transform capoluoghi data
            const capoluoghi = Array.isArray(area.aree_capoluoghi)
              ? area.aree_capoluoghi.map((rel: any) => rel.capoluoghi).filter(Boolean)
              : [];

            return {
              ...area,
              capoluoghi,
              stato: areaStato,
              stazioni_richieste,
              stazioni_assegnate,
              partner_count: partnerCount
            };
          } catch (err) {
            console.error(`❌ useAreeConStatistiche: Error processing area ${area.nome}:`, err);
            return {
              ...area,
              stazioni_richieste: 0,
              stazioni_assegnate: 0,
              partner_count: 0,
              stato: "In attivazione" // Default when error occurs
            };
          }
        }));

        console.log(`✅ useAreeConStatistiche: Completed processing all ${areasWithStats.length} areas with statistics`);
        console.log("Final processed data:", JSON.stringify(areasWithStats, null, 2));
        return areasWithStats as Area[];
      } catch (error) {
        console.error("❌ useAreeConStatistiche: Unhandled error in query function:", error);
        throw error;
      }
    },
    staleTime: 30000, // Data remains fresh for 30 seconds
    retry: 2, // Retry failed requests up to 2 times
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Additional logging for data state outside the queryFn
  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error("❌ useAreeConStatistiche: Error state detected:", error);
      } else if (!aree || aree.length === 0) {
        console.log("ℹ️ useAreeConStatistiche: Hook returned no areas");
      } else {
        console.log(`✅ useAreeConStatistiche: Hook successfully returned ${aree.length} areas`);
        // Log in detail the stazioni_richieste for each area to debug
        aree.forEach(area => {
          console.log(`✅ Area ${area.nome}: ${area.stazioni_richieste} stazioni richieste, ${area.stazioni_assegnate} stazioni assegnate, stato: ${area.stato}`);
        });
      }
    }
  }, [isLoading, error, aree]);

  return {
    aree: aree || [],
    isLoading,
    error,
    refetch
  };
};
