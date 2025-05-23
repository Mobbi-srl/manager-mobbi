
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contatto } from "./partnerTypes";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserAreas } from "@/hooks/users/useUserAreas";

export const useContattiQuery = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const { data: userAreas } = useUserAreas(user?.id);
  
  // Get user role
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isGestore = ruolo === "Gestore";
  
  return useQuery({
    queryKey: ["contatti", user?.id, ruolo, userAreas?.length],
    queryFn: async () => {
      console.log("Fetching contatti...", { userId: user?.id, role: ruolo });
      
      // Query for all contatti with their partner info
      let query = supabase
        .from("contatti")
        .select(`
          id, 
          nome, 
          cognome, 
          email, 
          numero, 
          ruolo,
          partner:partner_id (
            id,
            ragione_sociale,
            nome_locale,
            stato,
            tipologia_locale_id,
            indirizzo_operativa,
            citta_operativa,
            provincia_operativa,
            regione_operativa,
            nazione_operativa,
            segnalato_da,
            codice_utente_segnalatore,
            area_id
          )
        `);
      
      // If the user is a Gestore, filter by their assigned areas
      if (isGestore && userAreas && userAreas.length > 0) {
        console.log("Filtering contatti for Gestore role with areas:", userAreas);
        
        // Get IDs of areas assigned to this user
        const areaIds = userAreas.map(area => area.id);
        
        console.log("Gestore's area IDs:", areaIds);
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching contatti:", error);
          throw error;
        }
        
        // Filter the results in memory to only include partners that belong to the user's areas
        const filteredData = data?.filter(contatto => 
          contatto.partner && 
          contatto.partner.area_id && 
          areaIds.includes(contatto.partner.area_id)
        );
        
        console.log(`Filtered ${filteredData?.length || 0} contatti out of ${data?.length || 0} total for Gestore ${user?.id} with areas:`, areaIds);
        
        return filteredData as Contatto[];
      } else {
        console.log("Not filtering contatti by area - user is", ruolo);
        
        // For other roles, get all contatti
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching contatti:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} contatti for ${ruolo} user.`);
        return data as Contatto[];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user?.id && !!ruolo, // Only run query when we have user ID and role
  });
};
