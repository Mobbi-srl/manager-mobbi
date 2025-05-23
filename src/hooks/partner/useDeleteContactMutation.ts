
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const { data: contactData, error: contactError } = await supabase
        .from("contatti")
        .select("partner_id")
        .eq("id", contactId)
        .single();
      
      if (contactError) throw contactError;
      
      const partnerId = contactData.partner_id;
      
      // Delete the contact
      const { error } = await supabase
        .from("contatti")
        .delete()
        .eq("id", contactId);
      
      if (error) throw error;
      
      // Check if there are other contacts for this partner
      if (partnerId) {
        const { count, error: countError } = await supabase
          .from("contatti")
          .select("id", { count: "exact", head: true })
          .eq("partner_id", partnerId);
        
        if (countError) throw countError;
        
        // If no other contacts exist, delete the partner as well
        if (count === 0) {
          const { error: deletePartnerError } = await supabase
            .from("partner")
            .delete()
            .eq("id", partnerId);
          
          if (deletePartnerError) throw deletePartnerError;
          
          return { deletedPartner: true };
        }
      }
      
      return { deletedPartner: false };
    },
    onSuccess: (result) => {
      if (result.deletedPartner) {
        toast.success("Partner e contatto eliminati con successo");
      } else {
        toast.success("Contatto eliminato con successo");
      }
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
    },
    onError: (error) => {
      console.error("Error during deletion:", error);
      toast.error("Errore durante l'eliminazione");
    }
  });
};
