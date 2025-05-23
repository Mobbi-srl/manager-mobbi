
import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "./types";

export const useAddressOperations = (form: UseFormReturn<PartnerFormValues>) => {
  // Function to copy operational address to legal address - optimized with useCallback
  const copyOperativeToLegalAddress = useCallback(() => {
    const values = form.getValues();
    
    // Skip if no values available yet
    if (!values) return;
    
    // Only update if the checkbox is checked - use shouldDirty: false to prevent extra validation cycles
    if (values.indirizzoLegaleUgualeOperativo) {
      form.setValue("indirizzoLegale", values.indirizzo || "", { 
        shouldValidate: false, 
        shouldDirty: false 
      });
      form.setValue("cittaLegale", values.citta || "", { 
        shouldValidate: false,
        shouldDirty: false 
      });
      form.setValue("provinciaLegale", values.provincia || "", { 
        shouldValidate: false,
        shouldDirty: false 
      });
      form.setValue("regioneLegale", values.regione || "", { 
        shouldValidate: false,
        shouldDirty: false 
      });
      form.setValue("capLegale", values.cap || "", { 
        shouldValidate: false,
        shouldDirty: false 
      });
      form.setValue("nazioneLegale", values.nazione || "Italia", { 
        shouldValidate: false,
        shouldDirty: false 
      });
    }
  }, [form]);

  return { copyOperativeToLegalAddress };
};
