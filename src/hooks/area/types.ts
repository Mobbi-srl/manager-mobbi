import { Database } from "@/integrations/supabase/types";

export type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];
export type StatoPartner = Database["public"]["Enums"]["stato_partner"];

export interface AreaFormData {
  nome: string;
  regione: string;
  provincia: string; // This will be a comma-separated string for multiple provinces
  capoluoghi: string[];
  numero_stazioni: number;
  descrizione?: string;
}

export interface Area {
  id: string;
  nome: string;
  regione: RegioneItaliana;
  provincia?: string; // This could be a comma-separated string for multiple provinces
  province?: string[]; // New array field for multiple provinces
  comuni?: string[]; // Add the comuni property as an array of strings
  numero_stazioni?: number;
  descrizione?: string;
  stato?: string;
  capoluoghi?: { id: string; nome: string }[];
  numero_partner?: number;
  numero_partner_attivi?: number;
  numero_partner_selezionati?: number;
  numero_partner_contrattualizzati?: number;
  partner?: AreaPartner[];
  stazioni_richieste?: number; // Add missing property
  stazioni_assegnate?: number; // Add missing property
  partner_count?: number; // Add missing property
}

export interface AreaPartner {
  id: string;
  nome_locale: string;
  ragione_sociale: string;
  stato: StatoPartner;
  ranking?: number;
  ranking_confirmed?: boolean;
  richiesta_stazioni?: any;
  stazioni_allocate?: any;
  email?: string;
  telefono?: string;
  citta_operativa?: string;
  provincia_operativa?: string;
  regione_operativa?: string;
  indirizzo_operativa?: string;
  segnalato_da?: string;
  codice_utente_segnalatore?: string;
  numero_locali?: number;
  tipologia_locale?: string;
  data_installazione_richiesta?: string;
  contratto_firmato?: string;
}

export interface AreaStatistics {
  area_id: string;
  nome_area: string;
  regione: RegioneItaliana;
  numero_stazioni: number;
  numero_partner: number;
  numero_partner_attivi: number;
  numero_partner_selezionati: number;
  numero_partner_contrattualizzati: number;
}

export interface AreaManager {
  utente_id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: string;
}

export interface AreaStation {
  id: string;
  numero_seriale?: string;
  modello?: string;
  colore?: string;
  stato_stazione?: string;
  slot_disponibili?: number;
  partner_id?: string;
  partner_nome?: string;
  data_ingresso?: string;
  attiva?: boolean;
  manutenzione?: boolean;
}
