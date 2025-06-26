
// Partner Types
export interface Partner {
  id: string;
  nome_locale?: string;
  ragione_sociale?: string;
  indirizzo_operativa?: string;
  citta_operativa?: string;
  provincia_operativa?: string;
  regione_operativa?: string;
  nazione_operativa?: string;
  cap_operativa?: string; // Changed from number to string
  indirizzo_legale?: string;
  citta_legale?: string;
  provincia_legale?: string;
  regione_legale?: string;
  nazione_legale?: string;
  cap_legale?: string; // Changed from number to string
  piva?: string;
  sdi?: string;
  telefono?: string;
  email?: string;
  pec?: string;
  nome_rapp_legale?: string;
  cognome_rapp_legale?: string;
  luogo_nascita_rapp_legale?: string;
  data_nascita_rapp_legale?: string;
  indirizzo_residenza_rapp_legale?: string;
  citta_residenza_rapp_legale?: string;
  cap_residenza_rapp_legale?: string; // Changed from number to string
  nazione_residenza_rapp_legale?: string;
  codice_fiscale_rapp_legale?: string;
  contratto_firmato?: string;
  numero_locali?: number;
  tipologia_locale_id?: string;
  richiesta_stazioni?: any;
  stazioni_allocate?: any;
  ranking?: number;
  ranking_confirmed?: boolean;
  stato: "CONTATTO" | "APPROVATO" | "SELEZIONATO" | "ALLOCATO" | "CONTRATTUALIZZATO" | "PERSO" | "ATTIVO";
  segnalato_da?: string;
  codice_utente_segnalatore?: string;
  area_id?: string;
  comune_operativa_id?: string;
  data_installazione_richiesta?: string;
}

export interface Contatto {
  id: string;
  nome?: string;
  cognome?: string;
  email?: string;
  numero?: string;
  ruolo?: string;
  partner_id?: string;
  partner?: Partner;
}

export interface TipologiaLocale {
  id: string;
  tipologia: string;
}

export interface TipoStazione {
  id: string;
  tipologia: string;
  nome: string;
  slot: number;
  descrizione?: string;
}

export interface ColoreStazione {
  id: string;
  nome: string;
  codice_hex?: string;
  disponibile_per: string[];
}

export interface StazioneRichiesta {
  model: {
    modelId: string;
    modelName: string;
    colorId: string;
    colorName: string;
  };
  quantity: number;
}
