
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeletePartnerNoAreaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      console.log("🗑️ START: Deleting partner no area with contact ID:", contactId);
      
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
      
      // STEP 1: Get partner data to extract station serial numbers BEFORE any deletion
      const { data: partnerData } = await supabase
        .from("partner_no_area")
        .select("stazioni_allocate")
        .eq("id", partnerId)
        .single();
      
      // Extract serial numbers from stazioni_allocate if exists
      let serialNumbers: string[] = [];
      console.log("🔍 Partner data stazioni_allocate:", partnerData?.stazioni_allocate);
      
      if (partnerData?.stazioni_allocate) {
        try {
          const stazioniAllocate = JSON.parse(String(partnerData.stazioni_allocate));
          console.log("📊 Parsed stazioni_allocate:", stazioniAllocate);
          
          if (Array.isArray(stazioniAllocate)) {
            stazioniAllocate.forEach((stazione: any) => {
              console.log("🏭 Processing station:", stazione);
              if (stazione.serial_numbers && Array.isArray(stazione.serial_numbers)) {
                serialNumbers.push(...stazione.serial_numbers);
                console.log("📝 Added serial numbers:", stazione.serial_numbers);
              }
            });
          }
        } catch (error) {
          console.error("❌ Error parsing stazioni_allocate:", error);
        }
      }
      
      console.log("🎯 Total serial numbers to deactivate:", serialNumbers);
      
      // STEP 2: If there are serial numbers, move them back to New Warehouse FIRST
      if (serialNumbers.length > 0) {
        console.log(`🔄 CALLING deactivate-partner-stations: Moving ${serialNumbers.length} stations back to New Warehouse...`);
        console.log("📝 Serial numbers to process:", JSON.stringify(serialNumbers));
        try {
          const { data: deactivateResult, error: deactivateError } = await supabase.functions.invoke(
            'deactivate-partner-stations',
            {
              body: { serialNumbers }
            }
          );
          
          console.log("📨 Deactivate function response:", deactivateResult);
          console.log("📨 Deactivate function error:", deactivateError);
          
          if (deactivateError) {
            console.error("❌ Edge function invocation error:", deactivateError);
            throw new Error(`Failed to invoke deactivate function: ${deactivateError.message}`);
          }
          
          if (!deactivateResult?.success) {
            console.error("❌ Failed to move some stations:", deactivateResult);
            throw new Error(`Failed to deactivate stations: ${JSON.stringify(deactivateResult)}`);
          }
          
          console.log("✅ Successfully moved stations back to New Warehouse");
        } catch (error) {
          console.error("❌ Error calling deactivate-partner-stations:", error);
          throw error; // Stop the deletion process if deactivation fails
        }
      } else {
        console.log("⚠️ No serial numbers found - continuing with partner deletion");
        console.log("🔍 Partner data analysis: stazioni_allocate =", partnerData?.stazioni_allocate);
      }
      
      // STEP 3: Only proceed with database deletion if deactivation was successful (or no stations to deactivate)
      console.log("🗑️ Proceeding with database deletion...");
      
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
