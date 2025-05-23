
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaStation } from "./types";

export const useAreaStations = (areaId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["area_stations", areaId],
    queryFn: async () => {
      if (!areaId) return [];
      
      // In a real implementation, this would fetch from the stazioni table
      // For now, we're simulating the data
      const { data, error } = await supabase
        .from("stazioni")
        .select(`
          id,
          modello,
          numero_stazione,
          colore,
          slot_disponibili,
          partner_id,
          stato
        `)
        .limit(10);
      
      if (error) throw error;
      
      // Get partner names for the stations
      const partnerIds = data.map(s => s.partner_id).filter(Boolean);
      let partnerNames: Record<string, string> = {};
      
      if (partnerIds.length > 0) {
        const { data: partners } = await supabase
          .from("partner")
          .select("id, nome_locale, ragione_sociale")
          .in("id", partnerIds);
          
        if (partners) {
          partners.forEach(p => {
            partnerNames[p.id] = p.nome_locale || p.ragione_sociale || "Partner sconosciuto";
          });
        }
      }
      
      // Transform data
      return data.map(station => ({
        id: station.id,
        modello: station.modello,
        seriale: `SN-${station.numero_stazione || Math.floor(Math.random() * 10000)}`,
        colore: station.colore,
        slot_disponibili: station.slot_disponibili || 0,
        partner_nome: station.partner_id ? partnerNames[station.partner_id] : "-",
        stato: station.stato ? (station.stato === true ? "Attiva" : "Inattiva") : 
               Math.random() > 0.7 ? "Manutenzione" : "Attiva"
      })) as AreaStation[];
    },
    enabled: !!areaId
  });
  
  return {
    stations: data || [],
    isLoading,
    error
  };
};
