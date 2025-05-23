
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaManager } from "./types";

export const useAreaManagers = (areaId: string) => {
  console.log(`🔍 useAreaManagers: Starting to fetch managers for area ${areaId}`);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["area_managers", areaId],
    queryFn: async () => {
      if (!areaId) {
        console.log("❌ useAreaManagers: No areaId provided, returning empty array");
        return [];
      }
      
      console.log(`🔍 useAreaManagers: Fetching users assigned to area ${areaId}`);
      // Get users with the Gestore role who are assigned to this area
      const { data, error } = await supabase
        .from("utente_area")
        .select(`
          utente_id,
          anagrafica_utenti!inner(
            id,
            nome,
            cognome,
            telefono,
            ruolo
          )
        `)
        .eq("area_id", areaId);
      
      if (error) {
        console.error(`❌ useAreaManagers: Error fetching users for area ${areaId}:`, error);
        throw error;
      }
      
      console.log(`🔍 useAreaManagers: Found ${data?.length || 0} users assigned to area ${areaId}`);
      
      // Filter users to only include Gestori and format the data
      const managers = data
        .filter((ua: any) => ua.anagrafica_utenti.ruolo === "Gestore")
        .map((ua: any) => {
          const user = ua.anagrafica_utenti;
          
          return {
            id: user.id,
            nome: user.nome,
            cognome: user.cognome,
            telefono: user.telefono,
            partner_count: 0 // Will be updated below
          };
        });
      
      console.log(`🔍 useAreaManagers: Filtered to ${managers.length} managers for area ${areaId}`);
      
      // Get partner count for each manager
      console.log(`🔍 useAreaManagers: Getting partner counts for each manager`);
      for (const manager of managers) {
        console.log(`🔍 useAreaManagers: Counting partners for manager ${manager.nome} ${manager.cognome} (${manager.id})`);
        const { count } = await supabase
          .from("partner")
          .select("*", { count: "exact", head: true })
          .eq("segnalato_da", manager.id);
          
        manager.partner_count = count || 0;
        console.log(`🔍 useAreaManagers: Manager ${manager.nome} ${manager.cognome} has ${manager.partner_count} total partners`);
      }
      
      console.log(`✅ useAreaManagers: Completed processing ${managers.length} managers for area ${areaId}`);
      return managers as AreaManager[];
    },
    enabled: !!areaId
  });
  
  return {
    managers: data || [],
    isLoading,
    error
  };
};
