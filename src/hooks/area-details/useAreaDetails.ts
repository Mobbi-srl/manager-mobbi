
import { useAreaPartners } from "./useAreaPartners";
import { useAreaStations } from "./useAreaStations"; 
import { useAreaManagers } from "./useAreaManagers";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAreaDetails = (areaId: string) => {
  console.log(`🔍 useAreaDetails: Starting to fetch all data for area ${areaId}`);
  
  // Prefetch area basic information to ensure we have complete data
  const { data: areaData, isLoading: isLoadingAreaData } = useQuery({
    queryKey: ["area_basic", areaId],
    queryFn: async () => {
      if (!areaId) return null;
      
      console.log(`🔍 useAreaDetails: Fetching basic information for area ${areaId}`);
      const { data, error } = await supabase
        .from("aree_geografiche")
        .select(`
          id,
          nome,
          regione,
          stato,
          numero_stazioni,
          descrizione
        `)
        .eq("id", areaId)
        .single();
      
      if (error) {
        console.error(`❌ useAreaDetails: Error fetching area ${areaId}:`, error);
        throw error;
      }
      
      console.log(`✅ useAreaDetails: Successfully retrieved basic information for area ${areaId}:`, data);
      return data;
    },
    enabled: !!areaId,
    staleTime: 10000, // Consider data fresh for 10 seconds to prevent excessive refetching
  });

  const { isLoading: isLoadingPartners, partners } = useAreaPartners(areaId);
  const { isLoading: isLoadingStations, stations } = useAreaStations(areaId);
  const { isLoading: isLoadingManagers, managers } = useAreaManagers(areaId);
  
  // Log summary of what we found for debugging
  useEffect(() => {
    if (!isLoadingPartners && !isLoadingManagers && !isLoadingStations && areaId) {
      console.log(`✅ useAreaDetails: Summary for area ${areaId}:`);
      console.log(`  - Partners: ${partners?.length || 0}`);
      console.log(`  - Stations: ${stations?.length || 0}`);
      console.log(`  - Managers: ${managers?.length || 0}`);
      
      // Log some sample data from each collection if available
      if (partners && partners.length > 0) {
        console.log(`  - Sample partner: ${partners[0].nome_locale || partners[0].ragione_sociale}`);
      }
      if (stations && stations.length > 0) {
        console.log(`  - Sample station: ${stations[0].modello || 'Unknown model'}`);
      }
      if (managers && managers.length > 0) {
        console.log(`  - Sample manager: ${managers[0].nome} ${managers[0].cognome}`);
      }
    }
  }, [areaId, isLoadingPartners, isLoadingManagers, isLoadingStations, partners, stations, managers]);
  
  return {
    area: areaData,
    partners,
    stations,
    managers,
    isLoading: isLoadingPartners || isLoadingStations || isLoadingManagers || isLoadingAreaData
  };
};
