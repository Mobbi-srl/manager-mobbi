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
    regione_operativa?: string; // Added this missing property
  } | null;
}

export interface TipologiaStazione {
  id: string;
  nome: string;
}
