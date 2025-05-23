
import { supabase } from "@/integrations/supabase/client";
import { ContattoFormValues } from "../types";

export async function updatePartnerWithRepresentative(partnerId: string, contatto: ContattoFormValues) {
  try {
    const { error } = await supabase
      .from("partner")
      .update({
        nome_rapp_legale: contatto.nome,
        cognome_rapp_legale: contatto.cognome,
        data_nascita_rapp_legale: contatto.dataNascitaRappLegale ? contatto.dataNascitaRappLegale.toISOString().split('T')[0] : null,
        luogo_nascita_rapp_legale: contatto.luogoNascitaRappLegale,
        indirizzo_residenza_rapp_legale: contatto.indirizzoResidenzaRappLegale,
        cap_residenza_rapp_legale: contatto.capResidenzaRappLegale ? parseInt(contatto.capResidenzaRappLegale) : null,
        citta_residenza_rapp_legale: contatto.cittaResidenzaRappLegale,
        codice_fiscale_rapp_legale: contatto.codiceFiscaleRappLegale,
      })
      .eq("id", partnerId);

    if (error) {
      console.error("Errore nell'aggiornamento del rappresentante legale:", error);
    }
  } catch (err) {
    console.error("Errore nell'aggiornamento del rappresentante legale:", err);
  }
}
