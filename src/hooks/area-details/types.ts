
export interface AreaPartner {
  id: string;
  ragione_sociale?: string;
  nome_locale?: string;
  indirizzo_operativa?: string;
  citta_operativa?: string;
  provincia_operativa?: string;
  tipologia_locale?: string; // Add this field to match with the database
  ranking?: number;
  ranking_confirmed?: boolean;
  stato: string;
  richiesta_stazioni_raw?: {
    model: {
      modelId: string;
      modelName: string;
      colorId: string;
      colorName: string;
    };
    quantity: number;
  }[];
  stazioni_allocate?: number;
}

export interface AreaManager {
  id: string;
  nome: string;
  cognome: string;
  telefono?: string;
  partner_count: number;
}

export interface AreaStation {
  id: string;
  modello?: string;
  seriale?: string;
  colore?: string;
  slot_disponibili: number;
  partner_nome: string;
  stato?: string;
}
