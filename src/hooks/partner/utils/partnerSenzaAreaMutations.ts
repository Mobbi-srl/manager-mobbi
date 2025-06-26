
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mutation hook for partner_no_area creation
export const usePartnerSenzaAreaMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (partnerData: any) => {
      console.log("Creating partner senza area with data:", partnerData);
      
      const { data, error } = await supabase
        .from("partner_no_area")
        .insert(partnerData)
        .select();

      if (error) {
        console.error("Partner senza area creation error:", error);
        throw error;
      }
      
      console.log("Partner senza area created successfully:", data[0]);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners-no-area"] });
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
    },
    onError: (error: any) => {
      console.error("Errore nella creazione del partner senza area:", error);
      toast.error(`Errore nella creazione del partner senza area: ${error.message || "Errore sconosciuto"}`);
    }
  });
};

// Mutation hook for contatti_no_area creation
export const useContattoSenzaAreaMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contattiData: any[]) => {
      console.log("Creating contatti senza area with data:", contattiData);
      
      const { data, error } = await supabase
        .from("contatti_no_area")
        .insert(contattiData)
        .select();

      if (error) {
        console.error("Contatti senza area creation error:", error);
        throw error;
      }
      
      console.log("Contatti senza area created successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners-no-area"] });
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
    },
    onError: (error: any) => {
      console.error("Errore nella creazione dei contatti senza area:", error);
      toast.error(`Errore nella creazione dei contatti senza area: ${error.message || "Errore sconosciuto"}`);
    }
  });
};
