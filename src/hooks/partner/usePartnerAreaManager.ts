
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contatto } from "./partnerTypes";
import { useUserAreas } from "@/hooks/users/useUserAreas";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to manage the relationship between partners and area managers
 * Includes functionality to fetch area managers and associate partners with areas
 */
export const usePartnerAreaManager = () => {
  const [areaGestori, setAreaGestori] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Get all available areas to help with matching
  const { data: userAreas } = useUserAreas();

  // Fetch all gestori and their areas
  useEffect(() => {
    const fetchAreaGestori = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 usePartnerAreaManager: Fetching area gestori...");
        
        // Get all users with Gestore role who are assigned to areas
        const { data: gestoriData, error: gestoriError } = await supabase
          .from("vw_utenti_aree")
          .select("utente_id, area_id, nome, cognome, ruolo, area_nome")
          .eq("ruolo", "Gestore")
          .not("area_id", "is", null);
          
        if (gestoriError) {
          console.error("❌ usePartnerAreaManager: Error fetching gestori:", gestoriError);
          toast.error("Errore nel recupero dei gestori");
          setIsLoading(false);
          return;
        }
        
        console.log("✅ usePartnerAreaManager: Found gestori data:", gestoriData);
        
        // Process the data to create a mapping (area_id -> gestore names)
        const gestoriMap: Record<string, string> = {};
        
        gestoriData?.forEach(gestore => {
          if (gestore.area_id && gestore.nome && gestore.cognome) {
            const nomeCompleto = `${gestore.nome} ${gestore.cognome}`;
            const areaId = gestore.area_id;
            
            // If area already has a gestore listed, append this one
            if (gestoriMap[areaId]) {
              gestoriMap[areaId] += `, ${nomeCompleto}`;
            } else {
              gestoriMap[areaId] = nomeCompleto;
            }
            
            console.log(`✅ usePartnerAreaManager: Assigned gestore ${nomeCompleto} to area ${areaId} (${gestore.area_nome || "Unknown"})`);
          }
        });
        
        console.log("✅ usePartnerAreaManager: Area gestori mapping:", gestoriMap);
        setAreaGestori(gestoriMap);
        
      } catch (error) {
        console.error("❌ usePartnerAreaManager: Error in area gestori fetch:", error);
        toast.error("Errore nel recupero dei gestori");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAreaGestori();
  }, []);

  // Function to associate partners with areas based on location
  const associatePartnersWithAreas = useCallback(async (contatti: Contatto[]) => {
    if (!contatti.length || !userAreas || !userAreas.length) return;
    
    console.log("🔍 usePartnerAreaManager: Checking partners for area assignment...");
    
    const partnersToUpdate: { id: string; area_id: string }[] = [];
    
    // Get all area data for matching
    const { data: areas, error: areasError } = await supabase
      .from("aree_geografiche")
      .select("id, nome, regione");
    
    if (areasError) {
      console.error("❌ usePartnerAreaManager: Error fetching areas:", areasError);
      return;
    }
    
    // Find partners without area_id that should be assigned to an area
    for (const contatto of contatti) {
      if (contatto.partner && !contatto.partner.area_id && contatto.partner.provincia_operativa) {
        console.log(`🔍 usePartnerAreaManager: Partner ${contatto.partner.nome_locale} has no area_id, looking for a match...`);
        
        // Find matching area by regione
        const matchingArea = areas.find(area => 
          contatto.partner?.regione_operativa && 
          area.regione.toLowerCase() === contatto.partner.regione_operativa.toLowerCase()
        );
        
        if (matchingArea) {
          console.log(`✅ usePartnerAreaManager: Found matching area ${matchingArea.nome} for partner ${contatto.partner.nome_locale}`);
          
          partnersToUpdate.push({
            id: contatto.partner.id,
            area_id: matchingArea.id
          });
        }
      }
    }
    
    // Batch update partners with found areas
    if (partnersToUpdate.length > 0) {
      console.log(`🔄 usePartnerAreaManager: Associating ${partnersToUpdate.length} partners with areas:`, partnersToUpdate);
      
      for (const partner of partnersToUpdate) {
        const { error: updateError } = await supabase
          .from('partner')
          .update({ area_id: partner.area_id })
          .eq('id', partner.id);
          
        if (updateError) {
          console.error(`❌ usePartnerAreaManager: Error associating partner ${partner.id} with area:`, updateError);
        }
      }
      
      // Refresh the contatti data after updates
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      
      toast.success(`${partnersToUpdate.length} partner associati alle aree geografiche`);
      console.log("✅ usePartnerAreaManager: Partners associated with areas successfully");
    } else {
      console.log("ℹ️ usePartnerAreaManager: No partners need area association");
    }
  }, [userAreas, queryClient]);

  return {
    areaGestori,
    isLoading,
    associatePartnersWithAreas
  };
};
