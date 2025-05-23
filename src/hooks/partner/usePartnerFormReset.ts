
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "./types";
import { useCallback } from "react";

export const usePartnerFormReset = (
  form: UseFormReturn<PartnerFormValues>,
  resetContatti: () => void
) => {
  const resetForm = useCallback(() => {
    form.reset({
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
      richiestaStazioni: [],
      areaId: "", // Reset the areaId field
    });
    resetContatti();
  }, [form, resetContatti]);

  return { resetForm };
};
