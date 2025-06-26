
// Common types for partner-related hooks
export interface Contatto {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  numero: string;
  ruolo: string;
  partner: {
    id: string;
    ragione_sociale: string;
    nome_locale: string;
    stato?: string;
    tipologia_locale_id?: string;
    indirizzo_operativa?: string;
    citta_operativa?: string;
    provincia_operativa?: string; 
    nazione_operativa?: string;
    segnalato_da?: string;
    codice_utente_segnalatore?: string;
    area_id?: string;
    regione_operativa?: string;
  } | null;
}

export interface TipologiaStazione {
  id: string;
  nome: string;
}

// Define the StatoPartner enum that was missing but being imported elsewhere
export enum StatoPartner {
  APPROVATO = "APPROVATO",
  SELEZIONATO = "SELEZIONATO",
  ALLOCATO = "ALLOCATO",
  CONTRATTUALIZZATO = "CONTRATTUALIZZATO",
  PERSO = "PERSO",
  CONTATTO = "CONTATTO"
}

// StazioneRichiesta interface for the partner form
export interface StazioneRichiesta {
  modelId: string;
  modelName: string;
  colorId: string;
  colorName: string;
  quantity: number;
}

// Add this to the existing types.ts file, updating PartnerFormValues to include the new areaId field
export interface PartnerFormValues {
  nomeLocale: string;
  indirizzo: string;
  citta: string;
  provincia: string;
  regione: string;
  cap: string;
  nazione: string;
  tipologiaLocale: string;
  piva: string;
  ragioneSociale: string;
  sdi: string;
  indirizzoLegale: string;
  cittaLegale: string;
  provinciaLegale: string;
  regioneLegale: string;
  capLegale: string;
  nazioneLegale: string;
  numeroLocali: number;
  indirizzoLegaleUgualeOperativo: boolean;
  richiestaStazioni: any[];
  areaId?: string; // New field for the area selection
  ranking?: number; // Added ranking field
  note?: string; // New note field
}

export interface ContattoFormValues {
  nome: string;
  cognome: string;
  email: string;
  numero: string; // This matches the field in the Contatto interface
  ruolo: string;
  isRappresentanteLegale?: boolean;
  dataNascita?: Date;
  // Fields for legal representative
  dataNascitaRappLegale?: Date;
  luogoNascitaRappLegale?: string;
  indirizzoResidenzaRappLegale?: string;
  capResidenzaRappLegale?: string;
  cittaResidenzaRappLegale?: string;
  provinciaRappLegale?: string;
  regioneRappLegale?: string;
  nazioneRappLegale?: string;
  codiceFiscaleRappLegale?: string;
}
