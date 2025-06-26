
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePartnerNoArea = () => {
  const { data: partnersNoArea, isLoading, error } = useQuery({
    queryKey: ["partners-no-area"],
    queryFn: async () => {
      console.log("🔍 Fetching all partners from partner_no_area table");
      
      const { data, error } = await supabase
        .from("partner_no_area")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching partners no area:", error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} partners from partner_no_area`);
      return data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return {
    partnersNoArea,
    isLoading,
    error
  };
};
