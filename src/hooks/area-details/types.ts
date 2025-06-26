
export interface AreaPartner {
  id: string;
  ragione_sociale?: string;
  nome_locale?: string;
  tipologia_locale?: string;
  indirizzo_operativa?: string;
  citta_operativa?: string;
  provincia_operativa?: string;
  stato: string;
  ranking?: number;
  ranking_confirmed?: boolean;
  richiesta_stazioni_raw?: {
    model: {
      modelId: string;
      modelName: string;
      colorId: string;
      colorName: string;
    };
    quantity: number;
  }[];
  stazioni_allocate: any; // Can be number, object, or array
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
  documento_allegato?: string;
}
