
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaPartner } from "./types";
import { useAuth } from "@/hooks/auth";

export const useAreaPartners = (areaId: string) => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.ruolo;
  const isGestore = userRole === "Gestore";
  const userId = user?.id;

  const fetchPartners = async (): Promise<AreaPartner[]> => {
    console.log(`🔍 useAreaPartners: Fetching partners for area ${areaId}`);
    const modelliMap = {
      "33ee4c89-ad64-46aa-ad80-a31779f27326": { modelName: "Midi" },
      "418c0841-9bc1-466b-b16d-fb76632bd928": { modelName: "Mini" },
      "e4ef6723-f94f-4024-a1ec-745b18153d15": { modelName: "Maxi" },
    };

    const coloriMap = {
      "2b4e6b6a-4723-4c65-995b-e317a7a89fe1": { colorName: "Platinum Grey" },
      "6c9d9cf0-89df-4930-aab0-8cc76350134b": { colorName: "Black" },
      "7e988134-f1c7-4294-af9c-4e2c21be25c2": { colorName: "Champagne Oro" },
      "cc6289af-f9c3-437b-af0c-59bb49809775": { colorName: "Sky Blue" },
      "e55c73ea-606e-40cf-a6f1-a32f582627d0": { colorName: "Satin Bordeaux" },
    };
    // For all users, proceed to fetch partners for the specified area
    // We're no longer restricting Gestori from seeing partners in areas they don't manage
    // This is because we're in the Area Detail view, so if they can see the area, they should see its partners

    // Build the query to get partners for the area, with a join to get the tipologia_locale
    const { data, error } = await supabase
      .from('partner')
      .select(`
        id,
        ragione_sociale,
        nome_locale,
        tipologia_locale_id,
        locali(tipologia),
        indirizzo_operativa,
        citta_operativa,
        provincia_operativa,
        stato,
        ranking,
        ranking_confirmed,
        richiesta_stazioni,
        area_id
      `)
      .eq('area_id', areaId);

    if (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }

    console.log(`✅ useAreaPartners: Found ${data?.length || 0} partners for area ${areaId}`);

    // Get station counts for each partner
    const partnerIds = data.map(partner => partner.id);

    const { data: stationCounts, error: countError } = await supabase
      .from('stazioni')
      .select('partner_id, count')
      .in('partner_id', partnerIds)
      .select();

    if (countError) {
      console.error('Error fetching station counts:', countError);
    }

    // Create a map of partner_id to station count
    const stationCountMap: Record<string, number> = {};
    if (stationCounts) {
      stationCounts.forEach(item => {
        stationCountMap[item.partner_id] = (stationCountMap[item.partner_id] || 0) + 1;
      });
    }

    // Transform the data to match the AreaPartner interface
    return data.map(partner => {
      // Parse richiesta_stazioni to ensure it's in the correct format
      let parsedRequestedStations: {
        model: {
          modelId: string;
          modelName: string;
          colorId: string;
          colorName: string;
        };
        quantity: number;
      }[] = [];

      // Convert the richiesta_stazioni JSON to the expected format
      if (partner.richiesta_stazioni) {
        try {
          const stationsData = typeof partner.richiesta_stazioni === 'string'
            ? JSON.parse(partner.richiesta_stazioni)
            : partner.richiesta_stazioni;

          if (Array.isArray(stationsData)) {
            parsedRequestedStations = stationsData.map((item) => {
              const modelId = item.model?.modelId || item.modelId || "";
              const colorId = item.model?.colorId || item.colorId || "";

              return {
                model: {
                  modelId,
                  modelName: modelliMap[modelId]?.modelName || "Modello sconosciuto",
                  colorId,
                  colorName: coloriMap[colorId]?.colorName || "Colore sconosciuto"
                },
                quantity: item.quantity || 0
              };
            });
          }
        } catch (e) {
          console.error("Errore nel parsing di richiesta_stazioni:", e);
        }
      }


      return {
        id: partner.id,
        ragione_sociale: partner.ragione_sociale,
        nome_locale: partner.nome_locale,
        tipologia_locale: partner.locali?.tipologia, // Get tipologia from the locali relation
        indirizzo_operativa: partner.indirizzo_operativa,
        citta_operativa: partner.citta_operativa,
        provincia_operativa: partner.provincia_operativa,
        stato: partner.stato,
        ranking: partner.ranking,
        ranking_confirmed: partner.ranking_confirmed,
        richiesta_stazioni_raw: parsedRequestedStations,
        stazioni_allocate: stationCountMap[partner.id] || 0
      };
    });
  };

  // Use the query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["areaPartners", areaId],
    queryFn: fetchPartners,
    enabled: !!areaId
  });

  return {
    partners: data || [],
    isLoading,
    error,
    refetch
  };
};
