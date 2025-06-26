
import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { PartnerFormValues } from "./types";

export const usePartnerValidation = (form: UseFormReturn<PartnerFormValues>) => {
  const validateForm = useCallback(async () => {
    // Clear any existing errors first
    form.clearErrors();
    
    // Trigger form validation
    const isValid = await form.trigger();
    
    if (!isValid) {
      const errors = form.formState.errors;
      console.log("Form validation errors:", errors);
      
      // Show specific error messages
      if (errors.nomeLocale) {
        toast.error("Il nome del locale è obbligatorio");
        return false;
      }
      
      if (errors.tipologiaLocale) {
        toast.error("La tipologia del locale è obbligatoria");
        return false;
      }
      
      if (errors.ranking) {
        toast.error("La valutazione è obbligatoria e deve essere compresa tra 1 e 10");
        return false;
      }
      
      if (errors.ragioneSociale) {
        toast.error("La ragione sociale è obbligatoria");
        return false;
      }
      
      if (errors.piva) {
        toast.error("La partita IVA è obbligatoria");
        return false;
      }
      
      if (errors.indirizzo) {
        toast.error("L'indirizzo operativo è obbligatorio");
        return false;
      }
      
      if (errors.citta) {
        toast.error("La città operativa è obbligatoria");
        return false;
      }
      
      if (errors.provincia) {
        toast.error("La provincia operativa è obbligatoria");
        return false;
      }
      
      if (errors.regione) {
        toast.error("La regione operativa è obbligatoria");
        return false;
      }
      
      if (errors.cap) {
        toast.error("Il CAP operativo è obbligatorio");
        return false;
      }
      
      if (errors.indirizzoLegale) {
        toast.error("L'indirizzo legale è obbligatorio");
        return false;
      }
      
      if (errors.cittaLegale) {
        toast.error("La città legale è obbligatoria");
        return false;
      }
      
      if (errors.provinciaLegale) {
        toast.error("La provincia legale è obbligatoria");
        return false;
      }
      
      if (errors.regioneLegale) {
        toast.error("La regione legale è obbligatoria");
        return false;
      }
      
      if (errors.capLegale) {
        toast.error("Il CAP legale è obbligatorio");
        return false;
      }
      
      // Generic fallback message
      toast.error("Compila tutti i campi obbligatori prima di procedere");
      return false;
    }
    
    // Additional custom validation for ranking
    const rankingValue = form.getValues("ranking");
    if (!rankingValue || rankingValue < 1 || rankingValue > 10) {
      toast.error("La valutazione è obbligatoria e deve essere compresa tra 1 e 10");
      form.setError("ranking", {
        type: "manual",
        message: "La valutazione deve essere compresa tra 1 e 10"
      });
      return false;
    }
    
    return true;
  }, [form]);

  return {
    validateForm
  };
};
