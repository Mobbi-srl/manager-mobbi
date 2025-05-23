
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Custom hook to fetch area managers (gestori) mapping
 * @returns Area managers mapping and loading state
 */
export const useAreaManagers = () => {
  const [areaGestori, setAreaGestori] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAreaGestori = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 useAreaManagers: Fetching area gestori...");
        
        // Get all area-user relationships with proper joins
        const { data: areaUsers, error } = await supabase
          .from("utente_area")
          .select(`
            utente_id,
            area_id,
            anagrafica_utenti(nome, cognome, ruolo, email)
          `);
          
        if (error) {
          console.error("❌ useAreaManagers: Error fetching area-user relationships:", error);
          return;
        }
        
        console.log("✅ useAreaManagers: Area users data:", areaUsers);
        
        // Check if we need to find a user by email due to ID mismatch
        if (areaUsers.length === 0) {
          console.log("⚠️ useAreaManagers: No area-user relationships found, this may be due to ID mismatch");
          await fetchAreaGestoriByEmail();
          return;
        }
        
        // Process the data to create a mapping (area_id -> gestore names)
        const gestoriMap: Record<string, string> = {};
        
        areaUsers?.forEach(relation => {
          if (relation.anagrafica_utenti && relation.area_id) {
            const user = relation.anagrafica_utenti as { 
              nome: string; 
              cognome: string; 
              ruolo: string; 
              email: string;
            };
            
            // Only include Gestori in the mapping
            if (user.ruolo === "Gestore") {
              const nomeCompleto = `${user.nome} ${user.cognome}`;
              const areaId = relation.area_id;
              
              // If area already has a gestore listed, append this one
              if (gestoriMap[areaId]) {
                gestoriMap[areaId] += `, ${nomeCompleto}`;
              } else {
                gestoriMap[areaId] = nomeCompleto;
              }
              
              console.log(`✅ useAreaManagers: Assigned gestore ${nomeCompleto} to area ${areaId}`);
            }
          } else {
            console.log("⚠️ useAreaManagers: Skipping relation with missing data:", relation);
          }
        });
        
        console.log("✅ useAreaManagers: Area gestori mapping:", gestoriMap);
        setAreaGestori(gestoriMap);
        
        // If we don't have any mappings, try a fallback approach
        if (Object.keys(gestoriMap).length === 0) {
          console.log("⚠️ useAreaManagers: No gestori mappings found, trying fallback approach");
          await fetchAreaGestoriFallback();
        }
        
      } catch (error) {
        console.error("❌ useAreaManagers: Errore nel recupero dei gestori delle aree:", error);
        toast.error("Errore nel recupero dei gestori delle aree");
      } finally {
        setIsLoading(false);
      }
    };

    // Get area users with email lookup fallback
    const fetchAreaGestoriByEmail = async () => {
      try {
        console.log("🔍 useAreaManagers: Trying to fetch area users by email...");
        
        // Get authenticated user email
        const { data: authUser } = await supabase.auth.getUser();
        const userEmail = authUser?.user?.email;
        
        if (!userEmail) {
          console.log("⚠️ useAreaManagers: No user email available for lookup");
          setIsLoading(false);
          return;
        }
        
        // Find users by email instead of ID
        const { data: areaUsersByEmail, error } = await supabase
          .from("vw_utenti_aree")
          .select("utente_id, area_id, nome, cognome, ruolo")
          .eq("ruolo", "Gestore");
          
        if (error) {
          console.error("❌ useAreaManagers: Error fetching area users by email:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("✅ useAreaManagers: Area users data by email:", areaUsersByEmail);
        
        // Process the data to create a mapping (area_id -> gestore names)
        const gestoriMap: Record<string, string> = {};
        
        areaUsersByEmail?.forEach(relation => {
          if (relation.area_id && relation.nome && relation.cognome) {
            const nomeCompleto = `${relation.nome} ${relation.cognome}`;
            const areaId = relation.area_id;
            
            // If area already has a gestore listed, append this one
            if (gestoriMap[areaId]) {
              gestoriMap[areaId] += `, ${nomeCompleto}`;
            } else {
              gestoriMap[areaId] = nomeCompleto;
            }
            
            console.log(`✅ useAreaManagers: Assigned gestore ${nomeCompleto} to area ${areaId} (by email)`);
          }
        });
        
        console.log("✅ useAreaManagers: Area gestori mapping (by email):", gestoriMap);
        setAreaGestori(prev => ({...prev, ...gestoriMap}));
        setIsLoading(false);
      } catch (error) {
        console.error("❌ useAreaManagers: Error in email-based area managers fetch:", error);
        setIsLoading(false);
      }
    };
    
    // Fallback method to get area managers if the main approach fails
    const fetchAreaGestoriFallback = async () => {
      try {
        console.log("🔍 useAreaManagers: Using fallback method to get area managers");
        
        // Get all areas first
        const { data: areas, error: areasError } = await supabase
          .from("aree_geografiche")
          .select("id, nome");
          
        if (areasError) {
          console.error("❌ useAreaManagers: Error fetching areas:", areasError);
          setIsLoading(false);
          return;
        }
        
        // For each area, find Gestori
        const gestoriMap: Record<string, string> = {};
        
        for (const area of areas) {
          // Get all users with Gestore role who are assigned to this area
          const { data: gestori, error: gestoriError } = await supabase
            .from("vw_utenti_aree")  // Using the view as a fallback
            .select("utente_id, nome, cognome, ruolo")
            .eq("area_id", area.id)
            .eq("ruolo", "Gestore");
            
          if (gestoriError) {
            console.error(`❌ useAreaManagers: Error fetching gestori for area ${area.id}:`, gestoriError);
            continue;
          }
          
          if (gestori && gestori.length > 0) {
            const nomiGestori = gestori.map(g => `${g.nome} ${g.cognome}`).join(", ");
            gestoriMap[area.id] = nomiGestori;
            console.log(`✅ useAreaManagers: Fallback - Found gestori "${nomiGestori}" for area ${area.id} - ${area.nome}`);
          }
        }
        
        console.log("✅ useAreaManagers: Fallback area gestori mapping:", gestoriMap);
        setAreaGestori(prevMap => ({...prevMap, ...gestoriMap}));
        setIsLoading(false);
      } catch (error) {
        console.error("❌ useAreaManagers: Error in fallback area managers fetch:", error);
        setIsLoading(false);
      }
    };
    
    fetchAreaGestori();
  }, []);

  return { areaGestori, isLoading };
};
