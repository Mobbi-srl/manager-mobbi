
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeletePartnerNoAreaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      console.log("🗑️ Deleting partner no area with contact ID:", contactId);
      
      let partnerId: string;
      
      // Check if the contactId is a synthetic ID (ends with -empty)
      if (contactId.includes('-empty')) {
        // Extract the actual partner ID by removing the -empty suffix
        partnerId = contactId.replace('-empty', '');
        console.log("📝 Extracted partner ID from synthetic contact:", partnerId);
      } else {
        // Get the contact data from contatti_no_area to find the partner_id
        const { data: contactData, error: contactError } = await supabase
          .from("contatti_no_area")
          .select("partner_id")
          .eq("id", contactId)
          .single();
        
        if (contactError) {
          console.error("❌ Error finding contact in contatti_no_area:", contactError);
          throw contactError;
        }
        
        partnerId = contactData.partner_id;
        console.log("🏢 Partner ID from contact:", partnerId);
      }
      
      // Delete ALL contacts for this partner from contatti_no_area
      const { error: deleteContactsError } = await supabase
        .from("contatti_no_area")
        .delete()
        .eq("partner_id", partnerId);
      
      if (deleteContactsError) {
        console.error("❌ Error deleting contacts from contatti_no_area:", deleteContactsError);
        throw deleteContactsError;
      }
      
      console.log("✅ Deleted all contacts for partner from contatti_no_area");
      
      // Delete the partner from partner_no_area
      const { error: deletePartnerError } = await supabase
        .from("partner_no_area")
        .delete()
        .eq("id", partnerId);
      
      if (deletePartnerError) {
        console.error("❌ Error deleting partner from partner_no_area:", deletePartnerError);
        throw deletePartnerError;
      }
      
      console.log("✅ Deleted partner from partner_no_area");
      
      return { partnerId };
    },
    onSuccess: () => {
      toast.success("Partner eliminato con successo");
      // Fix: Use the correct query key that matches usePartnerSenzaArea
      queryClient.invalidateQueries({ queryKey: ["partner-senza-area"] });
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
    },
    onError: (error) => {
      console.error("❌ Error during partner no area deletion:", error);
      toast.error("Errore durante l'eliminazione del partner");
    }
  });
};
