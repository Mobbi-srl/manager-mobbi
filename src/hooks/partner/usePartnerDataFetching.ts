
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contatto } from "./partnerTypes";
import { ContattoFormValues, StazioneRichiesta, PartnerFormValues } from "./types";
import { UseFormReturn } from "react-hook-form";
import { safeArrayParse } from "@/utils/jsonUtils";

export const usePartnerDataFetching = (
  form: UseFormReturn<PartnerFormValues>,
  setContatti: (contatti: ContattoFormValues[]) => void,
) => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchPartnerDetails = async (isOpen: boolean, contatto: Contatto | null) => {
    if (!isOpen || !contatto?.partner?.id) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔍 Fetching partner details for ID:", contatto.partner.id);
      
      // Prima prova a cercare nella tabella partner principale
      let { data: partnerData, error: partnerError } = await supabase
        .from("partner")
        .select("*, locali:tipologia_locale_id(*)")
        .eq("id", contatto.partner.id)
        .maybeSingle();

      let isPartnerNoArea = false;
      
      // Se non trova il partner nella tabella principale, cerca in partner_no_area
      if (!partnerData) {
        console.log("🔍 Partner not found in main table, searching in partner_no_area...");
        
        const { data: partnerNoAreaData, error: partnerNoAreaError } = await supabase
          .from("partner_no_area")
          .select("*")
          .eq("id", contatto.partner.id)
          .maybeSingle();

        if (partnerNoAreaError) {
          console.error("❌ Error fetching from partner_no_area:", partnerNoAreaError);
          throw partnerNoAreaError;
        }

        if (partnerNoAreaData) {
          console.log("✅ Found partner in partner_no_area table");
          // Aggiungi i campi mancanti per compatibilità con il tipo
          partnerData = {
            ...partnerNoAreaData,
            area_id: null, // Partner senza area non ha area_id
            locali: null // Partner da partner_no_area non ha la join con locali
          };
          isPartnerNoArea = true;
        } else {
          throw new Error("Partner non trovato in nessuna tabella");
        }
      } else {
        console.log("✅ Found partner in main partner table");
      }

      if (partnerError && !isPartnerNoArea) {
        console.error("❌ Error fetching partner:", partnerError);
        throw partnerError;
      }

      console.log("📋 Partner data loaded:", partnerData);
      console.log("🏷️ Is partner without area:", isPartnerNoArea);

      // Load existing contatti for this partner from the appropriate table
      const contattiTable = isPartnerNoArea ? "contatti_no_area" : "contatti";
      console.log("🔍 Fetching contatti from table:", contattiTable);
      
      const { data: contattiData, error: contattiError } = await supabase
        .from(contattiTable)
        .select("*")
        .eq("partner_id", contatto.partner.id);

      if (contattiError) {
        console.error("❌ Error fetching contatti:", contattiError);
        throw contattiError;
      }

      console.log("📞 Contatti data loaded:", contattiData);

      // Process richiesta_stazioni using safe parsing
      const formattedStazioni = formatStazioniRichieste(partnerData.richiesta_stazioni);

      // Update form with partner data
      updatePartnerFormWithData(form, partnerData, formattedStazioni, isPartnerNoArea);

      // Format contacts for display
      if (contattiData && contattiData.length > 0) {
        const formattedContatti = contattiData.map(c => ({
          nome: c.nome || "",
          cognome: c.cognome || "",
          ruolo: c.ruolo || "",
          email: c.email || "",
          numero: c.numero || "",
          isRappresentanteLegale: false,
          id: c.id
        }));
        setContatti(formattedContatti);
        console.log("📞 Formatted contatti:", formattedContatti);
      } else {
        console.log("📞 No contatti found");
        setContatti([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("💥 Error fetching partner details:", error);
      toast.error("Errore nel caricamento dei dati del partner");
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchPartnerDetails
  };
};

// Utility functions 
function formatStazioniRichieste(richiesta_stazioni: any): StazioneRichiesta[] {
  console.log("Raw richiesta_stazioni:", richiesta_stazioni);
  
  // Use safe parsing utility
  const stazioniArray = safeArrayParse(richiesta_stazioni, []);
  
  const formattedStazioni = stazioniArray.map((stazione: any) => ({
    modelId: stazione.modelId || "",
    modelName: stazione.modelName || "",
    colorId: stazione.colorId || "",
    colorName: stazione.colorName || "",
    quantity: typeof stazione.quantity === 'number' ? stazione.quantity : 1
  }));
  
  console.log("Formatted stazioni for form:", formattedStazioni);
  return formattedStazioni;
}

function updatePartnerFormWithData(
  form: UseFormReturn<PartnerFormValues>, 
  partnerData: any,
  formattedStazioni: StazioneRichiesta[],
  isPartnerNoArea: boolean = false
) {
  // Log the ranking value for debugging
  console.log("Setting ranking value in form:", partnerData.ranking);
  console.log("Setting ranking_confirmed value in form:", partnerData.ranking_confirmed);
  console.log("Setting note value in form:", partnerData.note);
  
  form.reset({
    ragioneSociale: partnerData.ragione_sociale || "",
    nomeLocale: partnerData.nome_locale || "",
    indirizzo: partnerData.indirizzo_operativa || "",
    citta: partnerData.citta_operativa || "",
    provincia: partnerData.provincia_operativa || "",
    regione: partnerData.regione_operativa || "",
    cap: partnerData.cap_operativa || "", // Keep as string
    nazione: partnerData.nazione_operativa || "Italia",
    tipologiaLocale: partnerData.tipologia_locale_id || "",
    piva: partnerData.piva || "",
    sdi: partnerData.sdi || "",
    indirizzoLegale: partnerData.indirizzo_legale || "",
    cittaLegale: partnerData.citta_legale || "",
    provinciaLegale: partnerData.provincia_legale || "",
    regioneLegale: partnerData.regione_legale || "",
    capLegale: partnerData.cap_legale || "", // Keep as string
    nazioneLegale: partnerData.nazione_legale || "Italia",
    numeroLocali: partnerData.numero_locali || 1,
    ranking: partnerData.ranking !== null && partnerData.ranking !== undefined ? partnerData.ranking : null,
    note: partnerData.note || "", // Add note field
    indirizzoLegaleUgualeOperativo: false,
    richiestaStazioni: formattedStazioni,
    // Se è un partner senza area, non impostare area_id
    areaId: isPartnerNoArea ? "" : (partnerData.area_id || "")
  });
}
