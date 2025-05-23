
import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "./types";
import { toast } from "sonner";

export const usePartnerValidation = (form: UseFormReturn<PartnerFormValues>) => {
  const validateForm = useCallback(async () => {
    // Validate form data
    const formState = form.getValues();
    
    // Basic required fields
    if (!formState.nomeLocale) {
      toast.error("Inserisci il nome del locale");
      form.setError("nomeLocale", { message: "Campo obbligatorio" });
      return false;
    }

    // Validate operational address
    if (!formState.indirizzo || !formState.citta || !formState.provincia || !formState.regione) {
      toast.error("Compila tutti i campi dell'indirizzo operativo");
      
      if (!formState.indirizzo) form.setError("indirizzo", { message: "Campo obbligatorio" });
      if (!formState.citta) form.setError("citta", { message: "Campo obbligatorio" });
      if (!formState.provincia) form.setError("provincia", { message: "Campo obbligatorio" });
      if (!formState.regione) form.setError("regione", { message: "Campo obbligatorio" });
      
      return false;
    }

    // Validate area selection
    if (!formState.areaId) {
      toast.error("Seleziona un'area geografica");
      form.setError("areaId", { message: "Campo obbligatorio" });
      return false;
    }
    
    return true;
  }, [form]);

  return {
    validateForm
  };
};
