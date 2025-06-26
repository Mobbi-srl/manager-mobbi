
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PartnerFormValues, ContattoFormValues } from "./types";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { identifyUserForPartnerCreation } from "./utils/userIdentificationUtils";
import { formatPartnerData, formatContattiData } from "./utils/partnerDataFormatter";
import { updatePartnerWithRepresentative } from "./utils/updateLegalRepresentative";
import { usePartnerSenzaAreaMutation, useContattoSenzaAreaMutation } from "./utils/partnerSenzaAreaMutations";
import { validatePartnerSubmission } from "./utils/validation";

export const usePartnerSenzaAreaSubmission = (
  getFormValues: () => PartnerFormValues,
  contatti: ContattoFormValues[],
  resetForm: () => void,
  resetContatti: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  
  // Use the mutation hooks for partner_no_area table
  const partnerMutation = usePartnerSenzaAreaMutation();
  const contattoMutation = useContattoSenzaAreaMutation();

  // Function to submit partner data to partner_no_area table
  const submitPartner = useCallback(async () => {
    // Validate submission
    if (!validatePartnerSubmission(contatti, user?.id)) {
      return false;
    }

    setIsLoading(true);

    try {
      const formValues = getFormValues();
      console.log("Form values being submitted for partner senza area:", formValues);
      
      // Identify the user with the extracted utility
      const creatorInfo = await identifyUserForPartnerCreation(user, userProfile);
      
      // Format partner data without area_id
      const partnerData = {
        ...formatPartnerData(formValues, creatorInfo),
        area_id: undefined // Remove area_id for partner_no_area table
      };
      
      console.log("Partner data being sent to partner_no_area table:", partnerData);

      // Insert partner data into partner_no_area table
      const partner = await partnerMutation.mutateAsync(partnerData);

      if (partner && partner.id) {
        // Format contatti data for contatti_no_area table
        const contattiData = formatContattiData(contatti, partner.id);
        
        // Process legal representative if present
        const legalRepresentative = contatti.find(c => c.isRappresentanteLegale);
        if (legalRepresentative) {
          await updatePartnerWithRepresentative(partner.id, legalRepresentative, true); // true indicates no-area table
        }

        // Insert contatti data into contatti_no_area table
        await contattoMutation.mutateAsync(contattiData);
        
        // Success handling
        toast.success("Partner senza area e contatti creati con successo!");
        
        resetForm();
        resetContatti();
        setIsLoading(false);
        
        return true; // Indicate success
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Errore durante il salvataggio partner senza area:", error);
      toast.error(`Errore durante il salvataggio: ${error.message || "Errore sconosciuto"}`);
      setIsLoading(false);
      return false;
    }
  }, [contatti, getFormValues, partnerMutation, contattoMutation, user, userProfile, resetForm, resetContatti]);

  return { isLoading, submitPartner };
};
