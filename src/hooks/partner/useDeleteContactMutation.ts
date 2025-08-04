
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
            console.log("🗑️ No other contacts found, deleting partner from partner table");

            // STEP 1: Get partner data to extract station serial numbers BEFORE any deletion
            const { data: partnerData } = await supabase
              .from("partner")
              .select("stazioni_allocate")
              .eq("id", partnerId)
              .single();
            
            // Extract serial numbers from stazioni table (direct database query)
            let serialNumbers: string[] = [];
            console.log("🔍 Partner data stazioni_allocate:", partnerData?.stazioni_allocate);
            
            // First, get serial numbers from the stazioni table directly
            try {
              const { data: stazioniData, error: stazioniError } = await supabase
                .from('stazioni')
                .select('numero_seriale')
                .eq('partner_id', partnerId)
                .not('numero_seriale', 'is', null);

              if (stazioniError) {
                console.error("❌ Error fetching stazioni:", stazioniError);
              } else if (stazioniData && stazioniData.length > 0) {
                const dbSerialNumbers = stazioniData
                  .map(s => s.numero_seriale)
                  .filter(Boolean) as string[];
                serialNumbers.push(...dbSerialNumbers);
                console.log("📝 Found serial numbers from stazioni table:", dbSerialNumbers);
              }
            } catch (error) {
              console.error("❌ Error fetching stazioni data:", error);
            }
            
            // Also check stazioni_allocate field as fallback
            if (partnerData?.stazioni_allocate) {
              try {
                // Handle both string and object cases for stazioni_allocate
                let stazioniAllocate;
                if (typeof partnerData.stazioni_allocate === 'string') {
                  stazioniAllocate = JSON.parse(partnerData.stazioni_allocate);
                } else {
                  stazioniAllocate = partnerData.stazioni_allocate;
                }
                
                console.log("📊 Parsed stazioni_allocate:", stazioniAllocate);
                
                if (Array.isArray(stazioniAllocate)) {
                  stazioniAllocate.forEach((stazione: any) => {
                    console.log("🏭 Processing station:", stazione);
                    if (stazione.serial_numbers && Array.isArray(stazione.serial_numbers)) {
                      const newSerials = stazione.serial_numbers.filter((sn: string) => !serialNumbers.includes(sn));
                      serialNumbers.push(...newSerials);
                      console.log("📝 Added additional serial numbers from stazioni_allocate:", newSerials);
                    }
                  });
                }
              } catch (error) {
                console.error("❌ Error parsing stazioni_allocate:", error);
              }
            }
            
            // Remove duplicates
            serialNumbers = [...new Set(serialNumbers)];
            
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
              console.log("⚠️ No serial numbers found for partner deletion");
            }

            // STEP 3: Only proceed with database deletion if deactivation was successful (or no stations to deactivate)
            console.log("🗑️ Proceeding with database deletion...");
            
            // Also remove from area_partner if exists
            const { error: deleteAreaPartnerError } = await supabase
              .from("area_partner")
              .delete()
              .eq("partner_id", partnerId);
              
            if (deleteAreaPartnerError) {
              console.error("Error deleting area_partner relationship:", deleteAreaPartnerError);
            }
            
            // Delete associated stations first to avoid foreign key constraint
            const { error: deleteStationsError } = await supabase
              .from("stazioni")
              .delete()
              .eq("partner_id", partnerId);
            
            if (deleteStationsError) {
              console.error("Error deleting associated stations:", deleteStationsError);
              // Continue with partner deletion even if station deletion fails
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
            console.log("🗑️ No other contacts found, deleting partner from partner_no_area table");

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
                // Handle both string and object cases for stazioni_allocate
                let stazioniAllocate;
                if (typeof partnerData.stazioni_allocate === 'string') {
                  stazioniAllocate = JSON.parse(partnerData.stazioni_allocate);
                } else {
                  stazioniAllocate = partnerData.stazioni_allocate;
                }
                
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
              console.log("⚠️ No serial numbers found for partner_no_area deletion");
            }

            // STEP 3: Only proceed with database deletion if deactivation was successful (or no stations to deactivate)
            console.log("🗑️ Proceeding with database deletion...");
            
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
