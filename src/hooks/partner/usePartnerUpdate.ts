
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

    // Validazione obbligatoria: deve esserci almeno un contatto
    if (contatti.length === 0) {
      toast.error("È obbligatorio aggiungere almeno un contatto prima di salvare il partner");
      return false;
    }

    // Validazione dei campi obbligatori per ogni contatto
    for (let i = 0; i < contatti.length; i++) {
      const contattoItem = contatti[i];
      if (!contattoItem.nome || !contattoItem.cognome || !contattoItem.email) {
        toast.error(`Il contatto ${i + 1} deve avere almeno nome, cognome ed email compilati`);
        return false;
      }
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
      
      // Check if this is a partner from partner_no_area
      const { data: partnerNoAreaCheck, error: checkError } = await supabase
        .from("partner_no_area")
        .select("id")
        .eq("id", contatto.partner.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking if partner is from partner_no_area:", checkError);
        throw checkError;
      }

      const isPartnerNoArea = !!partnerNoAreaCheck;
      console.log("Is partner from partner_no_area:", isPartnerNoArea);

      // Determina se il partner deve rimanere in partner_no_area o essere spostato in partner
      const hasAreaSelected = values.areaId && values.areaId.trim() !== "";
      console.log("Has area selected:", hasAreaSelected, "Area ID:", values.areaId);

      if (isPartnerNoArea) {
        if (hasAreaSelected) {
          // Spostare da partner_no_area a partner (con area assegnata)
          console.log("🔄 Moving partner from partner_no_area to partner table with area assignment...");
          
          // Create new partner in main table
          const { data: newPartner, error: insertPartnerError } = await supabase
            .from("partner")
            .insert({
              ragione_sociale: values.ragioneSociale,
              nome_locale: values.nomeLocale,
              indirizzo_operativa: values.indirizzo,
              citta_operativa: values.citta,
              provincia_operativa: values.provincia,
              regione_operativa: values.regione,
              cap_operativa: values.cap || null,
              nazione_operativa: values.nazione,
              indirizzo_legale: values.indirizzoLegale,
              citta_legale: values.cittaLegale,
              provincia_legale: values.provinciaLegale,
              regione_legale: values.regioneLegale,
              cap_legale: values.capLegale || null,
              nazione_legale: values.nazioneLegale,
              piva: values.piva,
              sdi: values.sdi,
              numero_locali: values.numeroLocali,
              ranking: ranking,
              tipologia_locale_id: values.tipologiaLocale,
              richiesta_stazioni: richiestaStazioniData,
              area_id: values.areaId,
              note: values.note || null
            })
            .select()
            .single();

          if (insertPartnerError || !newPartner) {
            console.error("Error creating new partner:", insertPartnerError);
            throw insertPartnerError;
          }

          console.log("✅ New partner created in main table:", newPartner.id);

          // Create area_partner relationship
          const { error: areaPartnerError } = await supabase
            .from("area_partner")
            .insert({
              partner_id: newPartner.id,
              area_id: newPartner.area_id
            });

          if (areaPartnerError) {
            console.error("Error creating area_partner relationship:", areaPartnerError);
          }

          // Move contacts to main contatti table
          const contattiData = contatti.map(c => ({
            nome: c.nome,
            cognome: c.cognome,
            ruolo: c.ruolo,
            email: c.email,
            numero: c.numero,
            partner_id: newPartner.id,
          }));
          
          const { error: insertContattiError } = await supabase
            .from("contatti")
            .insert(contattiData);
            
          if (insertContattiError) {
            console.error("Error inserting new contatti:", insertContattiError);
            throw insertContattiError;
          }

          console.log("✅ Contatti moved to main table");

          // Remove old contacts from contatti_no_area
          const { error: deleteContattiError } = await supabase
            .from("contatti_no_area")
            .delete()
            .eq("partner_id", contatto.partner.id);

          if (deleteContattiError) {
            console.error("Error deleting old contatti:", deleteContattiError);
          }

          // Remove old partner from partner_no_area
          const { error: deletePartnerError } = await supabase
            .from("partner_no_area")
            .delete()
            .eq("id", contatto.partner.id);

          if (deletePartnerError) {
            console.error("Error deleting old partner:", deletePartnerError);
          }

          console.log("✅ Partner successfully moved from partner_no_area to partner table with area assignment");

        } else {
          // Aggiornare il partner in partner_no_area (rimane senza area)
          console.log("🔄 Updating partner in partner_no_area table (no area assigned)...");
          
          const { data: updatedPartner, error: updateError } = await supabase
            .from("partner_no_area")
            .update({
              ragione_sociale: values.ragioneSociale,
              nome_locale: values.nomeLocale,
              indirizzo_operativa: values.indirizzo,
              citta_operativa: values.citta,
              provincia_operativa: values.provincia,
              regione_operativa: values.regione,
              cap_operativa: values.cap || null,
              nazione_operativa: values.nazione,
              indirizzo_legale: values.indirizzoLegale,
              citta_legale: values.cittaLegale,
              provincia_legale: values.provinciaLegale,
              regione_legale: values.regioneLegale,
              cap_legale: values.capLegale || null,
              nazione_legale: values.nazioneLegale,
              piva: values.piva,
              sdi: values.sdi,
              numero_locali: values.numeroLocali,
              ranking: ranking,
              tipologia_locale_id: values.tipologiaLocale,
              richiesta_stazioni: richiestaStazioniData,
              note: values.note || null
            })
            .eq("id", contatto.partner.id)
            .select();

          if (updateError) {
            console.error("Update error:", updateError);
            throw updateError;
          }
          
          console.log("Update successful in partner_no_area, returned data:", updatedPartner);

          // Update contacts in contatti_no_area
          await updatePartnerContactsNoArea(contatto.partner.id, contatti);

          console.log("✅ Partner successfully updated in partner_no_area table");
        }
      } else {
        // This is a regular partner update in the main partner table
        console.log("🔄 Updating existing partner in main table...");
        
        const { data: updatedPartner, error: updateError } = await supabase
          .from("partner")
          .update({
            ragione_sociale: values.ragioneSociale,
            nome_locale: values.nomeLocale,
            indirizzo_operativa: values.indirizzo,
            citta_operativa: values.citta,
            provincia_operativa: values.provincia,
            regione_operativa: values.regione,
            cap_operativa: values.cap || null,
            nazione_operativa: values.nazione,
            indirizzo_legale: values.indirizzoLegale,
            citta_legale: values.cittaLegale,
            provincia_legale: values.provinciaLegale,
            regione_legale: values.regioneLegale,
            cap_legale: values.capLegale || null,
            nazione_legale: values.nazioneLegale,
            piva: values.piva,
            sdi: values.sdi,
            numero_locali: values.numeroLocali,
            ranking: ranking,
            tipologia_locale_id: values.tipologiaLocale,
            richiesta_stazioni: richiestaStazioniData,
            area_id: values.areaId || null,
            note: values.note || null
          })
          .eq("id", contatto.partner.id)
          .select();

        if (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }
        
        console.log("Update successful, returned data:", updatedPartner);
        
        // Handle contacts updates for regular partners
        await updatePartnerContacts(contatto.partner.id, contatti);
      }
      
      toast.success("Partner aggiornato con successo");
      handleOpenChange(false);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      queryClient.invalidateQueries({ queryKey: ["partner-senza-area"] });
      
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

async function updatePartnerContactsNoArea(partnerId: string, contatti: ContattoFormValues[]) {
  // Delete existing contacts in contatti_no_area
  const { error: deleteError } = await supabase
    .from("contatti_no_area")
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
      .from("contatti_no_area")
      .insert(contattiData);
      
    if (insertError) throw insertError;
  }
}
