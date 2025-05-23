
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContattoFormValues } from "../types";

// Mutation hook for partner creation
export const usePartnerMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (partnerData: any) => {
      console.log("Creating partner with data:", partnerData);
      
      const { data, error } = await supabase
        .from("partner")
        .insert(partnerData)
        .select();

      if (error) {
        console.error("Partner creation error:", error);
        throw error;
      }
      
      console.log("Partner created successfully:", data[0]);
      
      // If area_id is provided, create the area_partner relationship as well for backward compatibility
      if (data[0].area_id) {
        const { error: areaPartnerError } = await supabase
          .from("area_partner")
          .insert({
            partner_id: data[0].id,
            area_id: data[0].area_id
          });
          
        if (areaPartnerError) {
          console.error("Error creating area_partner relationship:", areaPartnerError);
          // Don't throw error, just log it - the main partner is created successfully
        }
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
    },
    onError: (error: any) => {
      console.error("Errore nella creazione del partner:", error);
      toast.error(`Errore nella creazione del partner: ${error.message || "Errore sconosciuto"}`);
    }
  });
};

// Mutation hook for contatto creation
export const useContattoMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contattiData: any[]) => {
      console.log("Creating contatti with data:", contattiData);
      
      const { data, error } = await supabase
        .from("contatti")
        .insert(contattiData)
        .select();

      if (error) {
        console.error("Contatti creation error:", error);
        throw error;
      }
      
      console.log("Contatti created successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
    },
    onError: (error: any) => {
      console.error("Errore nella creazione dei contatti:", error);
      toast.error(`Errore nella creazione dei contatti: ${error.message || "Errore sconosciuto"}`);
    }
  });
};
