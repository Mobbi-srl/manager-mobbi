
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PartnerFormValues, ContattoFormValues } from "./types";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { identifyUserForPartnerCreation } from "./utils/userIdentificationUtils";
import { formatPartnerData, formatContattiData } from "./utils/partnerDataFormatter";
import { updatePartnerWithRepresentative } from "./utils/updateLegalRepresentative";
import { usePartnerMutation, useContattoMutation } from "./utils/partnerMutations";
import { validatePartnerSubmission } from "./utils/validation";

export const usePartnerSubmission = (
  getFormValues: () => PartnerFormValues,
  contatti: ContattoFormValues[],
  resetForm: () => void,
  resetContatti: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  
  // Use the extracted mutation hooks
  const partnerMutation = usePartnerMutation();
  const contattoMutation = useContattoMutation();

  // Function to submit partner data
  const submitPartner = useCallback(async () => {
    // Validate submission
    if (!validatePartnerSubmission(contatti, user?.id)) {
      return false;
    }

    setIsLoading(true);

    try {
      const formValues = getFormValues();
      console.log("Form values being submitted:", formValues);
      
      // Identify the user with the extracted utility
      const creatorInfo = await identifyUserForPartnerCreation(user, userProfile);
      
      // Format partner data using the extracted utility
      const partnerData = formatPartnerData(formValues, creatorInfo);
      
      console.log("Partner data being sent to database:", partnerData);

      // Insert partner data
      const partner = await partnerMutation.mutateAsync(partnerData);

      if (partner && partner.id) {
        // Format contatti data using the extracted utility
        const contattiData = formatContattiData(contatti, partner.id);
        
        // Process legal representative if present
        const legalRepresentative = contatti.find(c => c.isRappresentanteLegale);
        if (legalRepresentative) {
          await updatePartnerWithRepresentative(partner.id, legalRepresentative);
        }

        // Insert contatti data
        await contattoMutation.mutateAsync(contattiData);
        
        // Success handling
        toast.success("Partner e contatti creati con successo!");
        
        resetForm();
        resetContatti();
        setIsLoading(false);
        
        return true; // Indicate success
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Errore durante il salvataggio:", error);
      toast.error(`Errore durante il salvataggio: ${error.message || "Errore sconosciuto"}`);
      setIsLoading(false);
      return false;
    }
  }, [contatti, getFormValues, partnerMutation, contattoMutation, user, userProfile, resetForm, resetContatti]);

  return { isLoading, submitPartner };
};
