
import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Contatto } from "./partnerTypes";
import { PartnerFormValues, ContattoFormValues } from "./types";

export const usePartnerUpdate = (
  form: UseFormReturn<PartnerFormValues>,
  contatti: ContattoFormValues[],
  handleOpenChange: (open: boolean) => void
) => {
  const queryClient = useQueryClient();

  const updatePartner = useCallback(async (contatto: Contatto | null) => {
    if (!contatto?.partner?.id) {
      toast.error("ID del partner non trovato");
      return false;
    }

    try {
      const values = form.getValues();
      console.log("Form values for update:", values);
      
      // Handle ranking value to meet database constraints (must be a positive integer or null)
      let ranking = null;
      if (values.ranking !== undefined && values.ranking !== null) {
        // Handle both number and string values depending on how the form captures it
        const rankingValue = typeof values.ranking === 'string' 
          ? parseInt(values.ranking, 10) 
          : values.ranking;
          
        // Make sure it's a positive integer or null
        ranking = !isNaN(rankingValue) && rankingValue > 0 ? rankingValue : null;
      }
      
      console.log("Processed ranking value:", ranking);

      // Get richiestaStazioni data from the form
      let richiestaStazioniData = [];
      
      // If richiestaStazioni exists in the form values, use it directly
      if (values.richiestaStazioni && Array.isArray(values.richiestaStazioni)) {
        richiestaStazioniData = values.richiestaStazioni;
      } else if (typeof values.richiestaStazioni === 'string') {
        try {
          const parsed = JSON.parse(values.richiestaStazioni);
          richiestaStazioniData = Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          console.error("Invalid JSON string for richiestaStazioni:", error);
          richiestaStazioniData = [];
        }
      } else if (values.richiestaStazioni && typeof values.richiestaStazioni === 'object') {
        richiestaStazioniData = [values.richiestaStazioni];
      }
      
      console.log("Final formatted richiesta_stazioni data:", richiestaStazioniData);
      
      // Update partner data
      const { data: updatedPartner, error: updateError } = await supabase
        .from("partner")
        .update({
          ragione_sociale: values.ragioneSociale,
          nome_locale: values.nomeLocale,
          indirizzo_operativa: values.indirizzo,
          citta_operativa: values.citta,
          provincia_operativa: values.provincia,
          regione_operativa: values.regione,
          cap_operativa: values.cap ? parseInt(values.cap) : null,
          nazione_operativa: values.nazione,
          indirizzo_legale: values.indirizzoLegale,
          citta_legale: values.cittaLegale,
          provincia_legale: values.provinciaLegale,
          regione_legale: values.regioneLegale,
          cap_legale: values.capLegale ? parseInt(values.capLegale) : null,
          nazione_legale: values.nazioneLegale,
          piva: values.piva,
          sdi: values.sdi,
          numero_locali: values.numeroLocali,
          ranking: ranking,
          tipologia_locale_id: values.tipologiaLocale,
          richiesta_stazioni: richiestaStazioniData,  // Pass array directly
          area_id: values.areaId || null
        })
        .eq("id", contatto.partner.id)
        .select();

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }
      
      console.log("Update successful, returned data:", updatedPartner);
      
      // Handle contacts updates - For simplicity, we're deleting and recreating contacts
      await updatePartnerContacts(contatto.partner.id, contatti);
      
      toast.success("Partner aggiornato con successo");
      handleOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      return true;
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
      toast.error("Errore durante l'aggiornamento del partner");
      return false;
    }
  }, [form, contatti, handleOpenChange, queryClient]);

  return { updatePartner };
};

async function updatePartnerContacts(partnerId: string, contatti: ContattoFormValues[]) {
  // Delete existing contacts
  const { error: deleteError } = await supabase
    .from("contatti")
    .delete()
    .eq("partner_id", partnerId);
    
  if (deleteError) throw deleteError;
  
  // Insert updated contacts if any exist
  if (contatti.length > 0) {
    const contattiData = contatti.map(c => ({
      nome: c.nome,
      cognome: c.cognome,
      ruolo: c.ruolo,
      email: c.email,
      numero: c.numero,
      partner_id: partnerId,
    }));
    
    const { error: insertError } = await supabase
      .from("contatti")
      .insert(contattiData);
      
    if (insertError) throw insertError;
  }
}
