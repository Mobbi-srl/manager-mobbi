
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from "@/integrations/supabase/types";

type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];

export interface LocalityData {
  comune: string;
  provincia: string;
  regione: string;
  sigla: string;
}

export const useProvinceComuniData = (selectedRegion?: string) => {
  // Fetch province data from Supabase
  const { data: provinceData } = useQuery({
    queryKey: ['province', selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return [];
      
      console.log(`🔍 useProvinceComuniData: Fetching provinces for region: ${selectedRegion}`);
      
      const { data, error } = await supabase
        .from('comuni_italiani')
        .select('provincia, sigla_provincia')
        .eq('regione', selectedRegion as RegioneItaliana);
      
      if (error) {
        console.error('❌ Error fetching provinces:', error);
        throw error;
      }
      
      console.log(`✅ Found ${data?.length || 0} records for region ${selectedRegion}`);
      
      // Remove duplicates and create unique provinces list
      const uniqueProvinces = Array.from(
        new Map(
          data?.map(item => [
            item.provincia, 
            { nome: item.provincia, sigla: item.sigla_provincia }
          ]) || []
        ).values()
      ).sort((a, b) => a.nome.localeCompare(b.nome));
      
      console.log(`✅ Unique provinces found:`, uniqueProvinces);
      return uniqueProvinces;
    },
    enabled: !!selectedRegion,
    staleTime: 300000, // 5 minutes
  });

  const provincesInRegion = useMemo(() => {
    return provinceData || [];
  }, [provinceData]);

  const getComuniByProvinces = (provinces?: string[]) => {
    if (!selectedRegion || !provinces || provinces.length === 0) return [];
    
    // This will be handled by the CitySelector component directly
    // We keep this function for compatibility but it's not used in the new implementation
    return [];
  };

  return {
    provincesInRegion,
    getComuniByProvinces
  };
};
