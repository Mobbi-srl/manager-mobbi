
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserAreas } from "@/hooks/users/useUserAreas";

export const useHomeStats = () => {
  const { user } = useAuth();
  const isGestoreRole = user?.user_metadata?.ruolo === "Gestore";
  
  // Get user-specific areas if the user is a Gestore
  const { data: userAreas } = useUserAreas(isGestoreRole ? user?.id : undefined);
  
  const aree = useQuery({
    queryKey: ["aree_geografiche", "attive", user?.id],
    queryFn: async (): Promise<number> => {
      // If user is a Gestore, count only their assigned areas
      if (isGestoreRole && userAreas) {
        const areaIds = userAreas.map(area => area.id);
        if (areaIds.length === 0) return 0;
        
        const { count, error } = await supabase
          .from("aree_geografiche")
          .select("*", { count: "exact", head: true })
          .eq("stato", "attiva")
          .in("id", areaIds);
          
        if (error) {
          console.error("Error fetching user areas count:", error);
          return 0;
        }
        
        return count || 0;
      } else {
        // For non-Gestore roles, count all active areas
        const { count, error } = await supabase
          .from("aree_geografiche")
          .select("*", { count: "exact", head: true })
          .eq("stato", "attiva");
          
        if (error) {
          return 0;
        }
        
        return count || 0;
      }
    },
    staleTime: 60000,
    enabled: !isGestoreRole || (isGestoreRole && !!userAreas),
  });
  
  const partner = useQuery({
    queryKey: ["partner", "tutti"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("partner")
        .select("*", { count: "exact", head: true });
        
      if (error) {
        return 0;
      }
      
      return count || 0;
    },
    staleTime: 60000,
  });
  
  const stazioni = useQuery({
    queryKey: ["stazioni", "operative"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("stazioni")
        .select("*", { count: "exact", head: true })
        .eq("attiva", true);
        
      if (error) {
        return 0;
      }
      
      return count || 0;
    },
    staleTime: 60000,
  });

  const stazioniDisponibili = useQuery({
    queryKey: ["aree_geografiche", "numero_stazioni", user?.id],
    queryFn: async (): Promise<number> => {
      // If user is a Gestore, sum only stations from their assigned areas
      if (isGestoreRole && userAreas) {
        if (userAreas.length === 0) return 0;
        
        const areaIds = userAreas.map(area => area.id);
        const { data, error } = await supabase
          .from("aree_geografiche")
          .select("numero_stazioni")
          .in("id", areaIds)
          .eq("stato", "attiva");
          
        if (error || !data) {
          console.error("Error fetching stations in user areas:", error);
          return 0;
        }
        
        return data.reduce((total: number, row: { numero_stazioni: number | null }) => 
          total + (row.numero_stazioni || 0), 0);
      } else {
        // For non-Gestore roles, sum stations from all areas
        const { data, error } = await supabase
          .from("aree_geografiche")
          .select("numero_stazioni")
          .eq("stato", "attiva");
          
        if (error || !data) return 0;
        
        return data.reduce((total: number, row: { numero_stazioni: number | null }) => 
          total + (row.numero_stazioni || 0), 0);
      }
    },
    staleTime: 60000,
    enabled: !isGestoreRole || (isGestoreRole && !!userAreas),
  });

  return { aree, partner, stazioni, stazioniDisponibili };
};
