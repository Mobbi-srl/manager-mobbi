import { useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PartnerFormValues } from "./types";
import { useContattoOperations } from "./useContattoOperations";
import { useAddressOperations } from "./useAddressOperations";
import { usePartnerSubmission } from "./usePartnerSubmission";
import { usePartnerValidation } from "./usePartnerValidation";
import { usePartnerFormReset } from "./usePartnerFormReset";

export const usePartnerForm = () => {
  // Keep track of whether we're updating legal address fields programmatically
  const isUpdatingLegalAddress = useRef(false);
  
  // Initialize the main form for the partner
  const form = useForm<PartnerFormValues>({
    defaultValues: {
      nomeLocale: "",
      indirizzo: "",
      citta: "",
      provincia: "",
      regione: "",
      cap: "",
      nazione: "Italia",
      tipologiaLocale: "",
      piva: "",
      ragioneSociale: "",
      sdi: "",
      indirizzoLegale: "",
      cittaLegale: "",
      provinciaLegale: "",
      regioneLegale: "",
      capLegale: "",
      nazioneLegale: "Italia",
      numeroLocali: 1,
      indirizzoLegaleUgualeOperativo: false,
      richiestaStazioni: []
    },
  });

  // Get contacts operations
  const {
    contatti,
    currentContatto,
    error,
    handleAddContatto,
    handleContattoChange,
    handleDateChange,
    handleRemoveContatto,
    resetContatti,
    setContatti
  } = useContattoOperations();

  // Get form reset functionality
  const { resetForm } = usePartnerFormReset(form, resetContatti);

  // Get form validation functionality
  const { validateForm } = usePartnerValidation(form);

  // Get address operations
  const { copyOperativeToLegalAddress } = useAddressOperations(form);

  // Only watch the checkbox and avoid watching all the fields to prevent unnecessary rerenders
  const indirizzoLegaleUgualeOperativo = form.watch("indirizzoLegaleUgualeOperativo");

  // Watch checkbox changes with clean dependencies, handle things only once
  useEffect(() => {
    if (indirizzoLegaleUgualeOperativo && !isUpdatingLegalAddress.current) {
      isUpdatingLegalAddress.current = true;
      copyOperativeToLegalAddress();
      isUpdatingLegalAddress.current = false;
    }
  }, [indirizzoLegaleUgualeOperativo, copyOperativeToLegalAddress]);

  // Add a subscription to form changes to update legal address when operational address changes
  useEffect(() => {
    if (!indirizzoLegaleUgualeOperativo) return;
    
    // Add a subscription to form changes
    const subscription = form.watch((value, { name }) => {
      // Only update if the checkbox is checked and we're changing an operational address field
      // And we're not already updating (to prevent loops)
      if (
        indirizzoLegaleUgualeOperativo &&
        !isUpdatingLegalAddress.current && 
        ["indirizzo", "citta", "provincia", "regione", "cap", "nazione"].includes(name || "")
      ) {
        isUpdatingLegalAddress.current = true;
        setTimeout(() => {
          copyOperativeToLegalAddress();
          isUpdatingLegalAddress.current = false;
        }, 0);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, indirizzoLegaleUgualeOperativo, copyOperativeToLegalAddress]);

  // Get form values with stable reference
  const getFormValues = useCallback(() => form.getValues(), [form]);
  
  // Get submission functionality
  const { isLoading, submitPartner } = usePartnerSubmission(
    getFormValues,
    contatti,
    resetForm,
    resetContatti
  );

  // Handle form submission with useCallback
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const isValid = await validateForm();
    if (!isValid) {
      return false;
    }
    
    return await submitPartner();
  }, [submitPartner, validateForm]);

  return {
    form,
    contatti,
    currentContatto,
    isLoading,
    error,
    handleAddContatto,
    handleContattoChange,
    handleRemoveContatto,
    handleDateChange,
    handleSubmit,
    resetForm,
    setContatti
  };
};

// Re-export types for convenience
export * from "./types";
