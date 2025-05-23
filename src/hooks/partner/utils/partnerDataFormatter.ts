
import { PartnerFormValues, ContattoFormValues } from "../types";

// Format partner data for database insertion
export const formatPartnerData = (formValues: PartnerFormValues, creatorInfo: any) => {
  // Process ranking to ensure it's a positive integer or null
  let ranking = null;
  if (formValues.ranking !== undefined && formValues.ranking !== null) {
    const rankingValue = typeof formValues.ranking === 'string' 
      ? parseInt(formValues.ranking, 10) 
      : formValues.ranking;
    
    // Make sure it's a positive integer or null
    ranking = !isNaN(rankingValue) && rankingValue > 0 ? rankingValue : null;
  }
  
  // Format stazioni richieste to ensure it's valid for the jsonb column
  let richiestaStazioniData = [];
  try {
    // If richiestaStazioni exists, ensure it's properly formatted
    if (formValues.richiestaStazioni) {
      if (Array.isArray(formValues.richiestaStazioni)) {
        // Use array directly - will be properly converted to jsonb by Supabase
        richiestaStazioniData = formValues.richiestaStazioni;
      } else if (typeof formValues.richiestaStazioni === 'string') {
        // If it's a string, try to parse it as JSON
        try {
          const parsed = JSON.parse(formValues.richiestaStazioni);
          richiestaStazioniData = Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          console.error("Invalid JSON string for richiestaStazioni:", error);
          richiestaStazioniData = [];
        }
      } else if (typeof formValues.richiestaStazioni === 'object' && !Array.isArray(formValues.richiestaStazioni)) {
        // If it's a non-array object, wrap it in an array
        richiestaStazioniData = [formValues.richiestaStazioni];
      }
    }
  } catch (error) {
    console.error("Error formatting richiestaStazioni:", error);
    richiestaStazioniData = []; // Fallback to empty array
  }
  
  console.log("Final formatted richiesta_stazioni data:", richiestaStazioniData);
  
  return {
    ragione_sociale: formValues.ragioneSociale,
    nome_locale: formValues.nomeLocale,
    indirizzo_operativa: formValues.indirizzo,
    citta_operativa: formValues.citta,
    provincia_operativa: formValues.provincia,
    regione_operativa: formValues.regione,
    cap_operativa: formValues.cap ? parseInt(formValues.cap) : null,
    nazione_operativa: formValues.nazione,
    indirizzo_legale: formValues.indirizzoLegale,
    citta_legale: formValues.cittaLegale,
    provincia_legale: formValues.provinciaLegale,
    regione_legale: formValues.regioneLegale,
    cap_legale: formValues.capLegale ? parseInt(formValues.capLegale) : null,
    nazione_legale: formValues.nazioneLegale,
    piva: formValues.piva,
    sdi: formValues.sdi,
    numero_locali: formValues.numeroLocali,
    ranking: ranking,
    tipologia_locale_id: formValues.tipologiaLocale,
    richiesta_stazioni: richiestaStazioniData, // Send array directly without stringify
    area_id: formValues.areaId || null,
    segnalato_da: creatorInfo.userId,
    codice_utente_segnalatore: creatorInfo.userDisplayName
  };
};

// Format contatti data for database insertion
export const formatContattiData = (contatti: ContattoFormValues[], partnerId: string) => {
  return contatti.map(c => ({
    nome: c.nome,
    cognome: c.cognome,
    ruolo: c.ruolo,
    email: c.email,
    numero: c.numero,
    partner_id: partnerId
  }));
};
