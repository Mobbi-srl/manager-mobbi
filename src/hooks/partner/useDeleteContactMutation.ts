
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      // First, check if the contact is in the main contatti table
      const { data: contactData, error: contactError } = await supabase
        .from("contatti")
        .select("partner_id")
        .eq("id", contactId)
        .maybeSingle();
      
      let partnerId = null;
      let isPartnerNoArea = false;
      
      if (contactError && contactError.code !== 'PGRST116') {
        throw contactError;
      }
      
      if (contactData) {
        // Contact found in main table
        partnerId = contactData.partner_id;
        
        // Delete the contact from main table
        const { error } = await supabase
          .from("contatti")
          .delete()
          .eq("id", contactId);
        
        if (error) throw error;
        
        // Check if there are other contacts for this partner in main table
        if (partnerId) {
          const { count, error: countError } = await supabase
            .from("contatti")
            .select("id", { count: "exact", head: true })
            .eq("partner_id", partnerId);
          
          if (countError) throw countError;
          
          // If no other contacts exist, delete the partner as well
          if (count === 0) {
            // Also remove from area_partner if exists
            const { error: deleteAreaPartnerError } = await supabase
              .from("area_partner")
              .delete()
              .eq("partner_id", partnerId);
              
            if (deleteAreaPartnerError) {
              console.error("Error deleting area_partner relationship:", deleteAreaPartnerError);
            }
            
            const { error: deletePartnerError } = await supabase
              .from("partner")
              .delete()
              .eq("id", partnerId);
            
            if (deletePartnerError) throw deletePartnerError;
            
            return { deletedPartner: true, isPartnerNoArea: false };
          }
        }
        
        return { deletedPartner: false, isPartnerNoArea: false };
      } else {
        // Contact not found in main table, check contatti_no_area
        const { data: contactNoAreaData, error: contactNoAreaError } = await supabase
          .from("contatti_no_area")
          .select("partner_id")
          .eq("id", contactId)
          .single();
        
        if (contactNoAreaError) throw contactNoAreaError;
        
        partnerId = contactNoAreaData.partner_id;
        isPartnerNoArea = true;
        
        // Delete the contact from contatti_no_area
        const { error } = await supabase
          .from("contatti_no_area")
          .delete()
          .eq("id", contactId);
        
        if (error) throw error;
        
        // Check if there are other contacts for this partner in contatti_no_area
        if (partnerId) {
          const { count, error: countError } = await supabase
            .from("contatti_no_area")
            .select("id", { count: "exact", head: true })
            .eq("partner_id", partnerId);
          
          if (countError) throw countError;
          
          // If no other contacts exist, delete the partner as well
          if (count === 0) {
            const { error: deletePartnerError } = await supabase
              .from("partner_no_area")
              .delete()
              .eq("id", partnerId);
            
            if (deletePartnerError) throw deletePartnerError;
            
            return { deletedPartner: true, isPartnerNoArea: true };
          }
        }
        
        return { deletedPartner: false, isPartnerNoArea: true };
      }
    },
    onSuccess: (result) => {
      if (result.deletedPartner) {
        toast.success("Partner e contatto eliminati con successo");
      } else {
        toast.success("Contatto eliminato con successo");
      }
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      queryClient.invalidateQueries({ queryKey: ["partners-no-area"] });
    },
    onError: (error) => {
      console.error("Error during deletion:", error);
      toast.error("Errore durante l'eliminazione");
    }
  });
};
