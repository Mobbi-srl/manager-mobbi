
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaStation } from "./types";

export const useAreaStations = (areaId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["area_stations", areaId],
    queryFn: async () => {
      console.log(`🔍 useAreaStations: Fetching stations for area ${areaId}`);
      
      let query = supabase
        .from("stazioni")
        .select(`
          id,
          modello,
          numero_seriale,
          colore,
          slot_disponibili,
          partner_id,
          attiva,
          documento_allegato
        `);
      
      // Se areaId è fornito, filtra per quell'area specifica
      // altrimenti recupera tutte le stazioni
      if (areaId) {
        // Prima ottieni i partner dell'area
        const { data: areaPartners, error: areaError } = await supabase
          .from("partner")
          .select("id")
          .eq("area_id", areaId);
          
        if (areaError) {
          console.error(`❌ Error fetching area partners for ${areaId}:`, areaError);
          throw areaError;
        }
        
        const partnerIds = areaPartners?.map(p => p.id) || [];
        
        if (partnerIds.length === 0) {
          console.log(`ℹ️ No partners found for area ${areaId}`);
          return [];
        }
        
        query = query.in("partner_id", partnerIds);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`❌ Error fetching stations:`, error);
        throw error;
      }
      
      console.log(`✅ Found ${data?.length || 0} stations${areaId ? ` for area ${areaId}` : ''}`);
      
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
        seriale: station.numero_seriale || `SN-${Math.floor(Math.random() * 10000)}`,
        colore: station.colore,
        slot_disponibili: station.slot_disponibili || 0,
        partner_nome: station.partner_id ? partnerNames[station.partner_id] : "-",
        stato: station.attiva ? "Attiva" : 
               Math.random() > 0.7 ? "Manutenzione" : "Inattiva",
        documento_allegato: station.documento_allegato
      })) as AreaStation[];
    },
    enabled: true
  });
  
  return {
    stations: data || [],
    isLoading,
    error
  };
};
