import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EdgeFunctionResponse {
  success: boolean;
  data: string[];
  cached?: boolean;
  cacheAge?: number;
  count?: number;
  message?: string;
  error?: string;
}

export const useKioskSerialNumbers = () => {
  return useQuery({
    queryKey: ["kiosk-serial-numbers"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.functions.invoke('get-kiosk-serial-numbers');

      if (error) {
        console.error("Error calling edge function:", error);
        throw new Error("Failed to fetch kiosk serial numbers");
      }

      const response: EdgeFunctionResponse = data;

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch kiosk serial numbers");
      }

      console.log(`Fetched ${response.data.length} serial numbers${response.cached ? ' (from cache)' : ' (fresh data)'}`);
      
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 ore - cache lato client
    gcTime: 24 * 60 * 60 * 1000, // 24 ore - mantieni in memoria
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};