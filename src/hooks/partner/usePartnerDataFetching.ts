
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contatto } from "./partnerTypes";
import { ContattoFormValues, StazioneRichiesta, PartnerFormValues } from "./types";
import { UseFormReturn } from "react-hook-form";

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
      // Get partner details
      const { data: partnerData, error: partnerError } = await supabase
        .from("partner")
        .select("*, locali:tipologia_locale_id(*)")
        .eq("id", contatto.partner.id)
        .single();

      if (partnerError) throw partnerError;

      console.log("Partner data loaded:", partnerData);
      console.log("Original ranking value:", partnerData.ranking);
      console.log("Original ranking_confirmed:", partnerData.ranking_confirmed);
      console.log("Original richiesta_stazioni:", partnerData.richiesta_stazioni);

      // Load existing contatti for this partner
      const { data: contattiData, error: contattiError } = await supabase
        .from("contatti")
        .select("*")
        .eq("partner_id", contatto.partner.id);

      if (contattiError) throw contattiError;

      // Process richiesta_stazioni to ensure it matches the expected format
      let formattedStazioni: StazioneRichiesta[] = [];
      try {
        formattedStazioni = formatStazioniRichieste(partnerData.richiesta_stazioni);
      } catch (err) {
        console.error("Error formatting stazioni:", err);
        formattedStazioni = [];
      }

      // Update form with partner data
      updatePartnerFormWithData(form, partnerData, formattedStazioni);

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
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching partner details:", error);
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
  let formattedStazioni: StazioneRichiesta[] = [];
  
  // Debug the incoming value
  console.log("Raw richiesta_stazioni:", richiesta_stazioni);
  
  // Check if richiesta_stazioni exists
  if (!richiesta_stazioni) {
    console.log("No richiesta_stazioni data found, returning empty array");
    return [];
  }
  
  try {
    // Handle different possible formats coming from the database
    let stazioni = richiesta_stazioni;
    
    // If it's already a valid array, use it directly
    if (Array.isArray(stazioni)) {
      console.log("richiesta_stazioni is already an array:", stazioni);
    } 
    // If it's a JSON string, parse it
    else if (typeof richiesta_stazioni === 'string') {
      try {
        stazioni = JSON.parse(richiesta_stazioni);
        console.log("Parsed richiesta_stazioni from string:", stazioni);
      } catch (e) {
        console.error("Failed to parse richiesta_stazioni string:", e);
        stazioni = [];
      }
    } 
    // If it's a single object (not array), wrap it in an array
    else if (typeof richiesta_stazioni === 'object' && richiesta_stazioni !== null) {
      stazioni = [richiesta_stazioni];
      console.log("Wrapped single object in array:", stazioni);
    }
    
    // Ensure stazioni is an array
    stazioni = Array.isArray(stazioni) ? stazioni : [];
    
    console.log("Processed stazioni array:", stazioni);
    
    formattedStazioni = stazioni.map((stazione: any) => ({
      modelId: stazione.modelId || "",
      modelName: stazione.modelName || "",
      colorId: stazione.colorId || "",
      colorName: stazione.colorName || "",
      quantity: typeof stazione.quantity === 'number' ? stazione.quantity : 1
    }));
    
    console.log("Formatted stazioni for form:", formattedStazioni);
  } catch (e) {
    console.error("Error processing richiesta_stazioni:", e);
    console.log("Raw value causing error:", richiesta_stazioni);
    formattedStazioni = [];
  }
  
  return formattedStazioni;
}

function updatePartnerFormWithData(
  form: UseFormReturn<PartnerFormValues>, 
  partnerData: any,
  formattedStazioni: StazioneRichiesta[]
) {
  // Log the ranking value for debugging
  console.log("Setting ranking value in form:", partnerData.ranking);
  console.log("Setting ranking_confirmed value in form:", partnerData.ranking_confirmed);
  
  form.reset({
    ragioneSociale: partnerData.ragione_sociale || "",
    nomeLocale: partnerData.nome_locale || "",
    indirizzo: partnerData.indirizzo_operativa || "",
    citta: partnerData.citta_operativa || "",
    provincia: partnerData.provincia_operativa || "",
    regione: partnerData.regione_operativa || "",
    cap: partnerData.cap_operativa ? partnerData.cap_operativa.toString() : "",
    nazione: partnerData.nazione_operativa || "Italia",
    tipologiaLocale: partnerData.tipologia_locale_id || "",
    piva: partnerData.piva || "",
    sdi: partnerData.sdi || "",
    indirizzoLegale: partnerData.indirizzo_legale || "",
    cittaLegale: partnerData.citta_legale || "",
    provinciaLegale: partnerData.provincia_legale || "",
    regioneLegale: partnerData.regione_legale || "",
    capLegale: partnerData.cap_legale ? partnerData.cap_legale.toString() : "",
    nazioneLegale: partnerData.nazione_legale || "Italia",
    numeroLocali: partnerData.numero_locali || 1,
    ranking: partnerData.ranking !== null && partnerData.ranking !== undefined ? partnerData.ranking : null,
    indirizzoLegaleUgualeOperativo: false,
    richiestaStazioni: formattedStazioni,
    areaId: partnerData.area_id || ""
  });
}
