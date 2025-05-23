
import { Database } from "@/integrations/supabase/types";

export type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];
export type StatoArea = "attiva" | "inattiva" | "In attivazione";

export type Area = Database["public"]["Tables"]["aree_geografiche"]["Row"] & {
  capoluoghi?: { nome: string }[];
  stazioni_richieste?: number;
  stazioni_assegnate?: number;
  partner_count?: number;
};

export type AreaFormData = {
  nome: string;
  regione: string;
  provincia: string; // Aggiunto campo provincia come obbligatorio
  capoluoghi: string[];
  numero_stazioni: number;
  descrizione?: string;
};
