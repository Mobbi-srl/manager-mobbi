export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      anagrafica_utenti: {
        Row: {
          cognome: string
          email: string
          id: string
          nome: string
          ruolo: Database["public"]["Enums"]["ruolo_utente"]
          telefono: string | null
        }
        Insert: {
          cognome: string
          email: string
          id?: string
          nome: string
          ruolo: Database["public"]["Enums"]["ruolo_utente"]
          telefono?: string | null
        }
        Update: {
          cognome?: string
          email?: string
          id?: string
          nome?: string
          ruolo?: Database["public"]["Enums"]["ruolo_utente"]
          telefono?: string | null
        }
        Relationships: []
      }
      area_partner: {
        Row: {
          area_id: string
          partner_id: string
        }
        Insert: {
          area_id: string
          partner_id: string
        }
        Update: {
          area_id?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "area_partner_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "area_station_requests"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "area_partner_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "aree_geografiche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "area_partner_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "area_partner_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner"
            referencedColumns: ["id"]
          },
        ]
      }
      aree_capoluoghi: {
        Row: {
          area_id: string
          capoluogo_id: string
        }
        Insert: {
          area_id: string
          capoluogo_id: string
        }
        Update: {
          area_id?: string
          capoluogo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aree_capoluoghi_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "area_station_requests"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "aree_capoluoghi_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "aree_geografiche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aree_capoluoghi_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "aree_capoluoghi_capoluogo_id_fkey"
            columns: ["capoluogo_id"]
            isOneToOne: false
            referencedRelation: "capoluoghi"
            referencedColumns: ["id"]
          },
        ]
      }
      aree_geografiche: {
        Row: {
          comuni: string[] | null
          descrizione: string | null
          id: string
          nome: string
          numero_stazioni: number | null
          province: string[] | null
          provincia: string | null
          regione: Database["public"]["Enums"]["regione_italiana"]
          stato: string | null
        }
        Insert: {
          comuni?: string[] | null
          descrizione?: string | null
          id?: string
          nome: string
          numero_stazioni?: number | null
          province?: string[] | null
          provincia?: string | null
          regione: Database["public"]["Enums"]["regione_italiana"]
          stato?: string | null
        }
        Update: {
          comuni?: string[] | null
          descrizione?: string | null
          id?: string
          nome?: string
          numero_stazioni?: number | null
          province?: string[] | null
          provincia?: string | null
          regione?: Database["public"]["Enums"]["regione_italiana"]
          stato?: string | null
        }
        Relationships: []
      }
      attivita: {
        Row: {
          creato_il: string | null
          dati: Json | null
          descrizione: string
          id: string
          tipo: string
          utente_id: string | null
        }
        Insert: {
          creato_il?: string | null
          dati?: Json | null
          descrizione: string
          id?: string
          tipo: string
          utente_id?: string | null
        }
        Update: {
          creato_il?: string | null
          dati?: Json | null
          descrizione?: string
          id?: string
          tipo?: string
          utente_id?: string | null
        }
        Relationships: []
      }
      capoluoghi: {
        Row: {
          id: string
          nome: string
          regione: Database["public"]["Enums"]["regione_italiana"]
        }
        Insert: {
          id?: string
          nome: string
          regione: Database["public"]["Enums"]["regione_italiana"]
        }
        Update: {
          id?: string
          nome?: string
          regione?: Database["public"]["Enums"]["regione_italiana"]
        }
        Relationships: []
      }
      colori_stazione: {
        Row: {
          codice_hex: string | null
          disponibile_per: string[]
          id: string
          nome: string
        }
        Insert: {
          codice_hex?: string | null
          disponibile_per: string[]
          id?: string
          nome: string
        }
        Update: {
          codice_hex?: string | null
          disponibile_per?: string[]
          id?: string
          nome?: string
        }
        Relationships: []
      }
      comuni_italiani: {
        Row: {
          cap: string | null
          codice_catastale: string | null
          coordinate_lat: number | null
          coordinate_lng: number | null
          created_at: string | null
          id: string
          is_capoluogo: boolean | null
          nome: string
          prefisso: string | null
          provincia: string
          regione: Database["public"]["Enums"]["regione_italiana"]
          sigla_provincia: string
          updated_at: string | null
        }
        Insert: {
          cap?: string | null
          codice_catastale?: string | null
          coordinate_lat?: number | null
          coordinate_lng?: number | null
          created_at?: string | null
          id?: string
          is_capoluogo?: boolean | null
          nome: string
          prefisso?: string | null
          provincia: string
          regione: Database["public"]["Enums"]["regione_italiana"]
          sigla_provincia: string
          updated_at?: string | null
        }
        Update: {
          cap?: string | null
          codice_catastale?: string | null
          coordinate_lat?: number | null
          coordinate_lng?: number | null
          created_at?: string | null
          id?: string
          is_capoluogo?: boolean | null
          nome?: string
          prefisso?: string | null
          provincia?: string
          regione?: Database["public"]["Enums"]["regione_italiana"]
          sigla_provincia?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contatti: {
        Row: {
          cognome: string | null
          email: string | null
          id: string
          nome: string | null
          numero: string | null
          partner_id: string | null
          ruolo: string | null
        }
        Insert: {
          cognome?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          numero?: string | null
          partner_id?: string | null
          ruolo?: string | null
        }
        Update: {
          cognome?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          numero?: string | null
          partner_id?: string | null
          ruolo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatti_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner"
            referencedColumns: ["id"]
          },
        ]
      }
      Contatti_Campagne: {
        Row: {
          "associazione automatica": boolean | null
          città: string | null
          created_at: string
          email: string | null
          id: number
          nome_locale: string | null
          number: number | null
          regione: string | null
          tipologia_locale: string | null
        }
        Insert: {
          "associazione automatica"?: boolean | null
          città?: string | null
          created_at?: string
          email?: string | null
          id?: number
          nome_locale?: string | null
          number?: number | null
          regione?: string | null
          tipologia_locale?: string | null
        }
        Update: {
          "associazione automatica"?: boolean | null
          città?: string | null
          created_at?: string
          email?: string | null
          id?: number
          nome_locale?: string | null
          number?: number | null
          regione?: string | null
          tipologia_locale?: string | null
        }
        Relationships: []
      }
      contatti_no_area: {
        Row: {
          cognome: string | null
          email: string | null
          id: string
          nome: string | null
          numero: string | null
          partner_id: string | null
          ruolo: string | null
        }
        Insert: {
          cognome?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          numero?: string | null
          partner_id?: string | null
          ruolo?: string | null
        }
        Update: {
          cognome?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          numero?: string | null
          partner_id?: string | null
          ruolo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatti_no_area_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_no_area"
            referencedColumns: ["id"]
          },
        ]
      }
      installazioni: {
        Row: {
          fonte_richiesta_id: string | null
          id: string
          partner_id: string | null
          ranking_partner: number | null
          referente_id: string | null
          stazione_id: string | null
          tipologia_stazione_id: string | null
        }
        Insert: {
          fonte_richiesta_id?: string | null
          id?: string
          partner_id?: string | null
          ranking_partner?: number | null
          referente_id?: string | null
          stazione_id?: string | null
          tipologia_stazione_id?: string | null
        }
        Update: {
          fonte_richiesta_id?: string | null
          id?: string
          partner_id?: string | null
          ranking_partner?: number | null
          referente_id?: string | null
          stazione_id?: string | null
          tipologia_stazione_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installazioni_fonte_richiesta_id_fkey"
            columns: ["fonte_richiesta_id"]
            isOneToOne: false
            referencedRelation: "anagrafica_utenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installazioni_fonte_richiesta_id_fkey"
            columns: ["fonte_richiesta_id"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["utente_id"]
          },
          {
            foreignKeyName: "installazioni_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installazioni_referente_id_fkey"
            columns: ["referente_id"]
            isOneToOne: false
            referencedRelation: "contatti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installazioni_stazione_id_fkey"
            columns: ["stazione_id"]
            isOneToOne: false
            referencedRelation: "stazioni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installazioni_tipologia_stazione_id_fkey"
            columns: ["tipologia_stazione_id"]
            isOneToOne: false
            referencedRelation: "stazioni"
            referencedColumns: ["id"]
          },
        ]
      }
      locali: {
        Row: {
          id: string
          tipologia: string
        }
        Insert: {
          id?: string
          tipologia: string
        }
        Update: {
          id?: string
          tipologia?: string
        }
        Relationships: []
      }
      modelli_stazione: {
        Row: {
          descrizione: string | null
          id: string
          nome: string
          slot: number
          tipologia: string
        }
        Insert: {
          descrizione?: string | null
          id?: string
          nome: string
          slot: number
          tipologia: string
        }
        Update: {
          descrizione?: string | null
          id?: string
          nome?: string
          slot?: number
          tipologia?: string
        }
        Relationships: []
      }
      notifiche: {
        Row: {
          creato_il: string | null
          dati: Json | null
          id: string
          letta: boolean | null
          messaggio: string
          tipo: string
          titolo: string
          utente_id: string | null
        }
        Insert: {
          creato_il?: string | null
          dati?: Json | null
          id?: string
          letta?: boolean | null
          messaggio: string
          tipo: string
          titolo: string
          utente_id?: string | null
        }
        Update: {
          creato_il?: string | null
          dati?: Json | null
          id?: string
          letta?: boolean | null
          messaggio?: string
          tipo?: string
          titolo?: string
          utente_id?: string | null
        }
        Relationships: []
      }
      partner: {
        Row: {
          area_id: string | null
          cap_legale: string | null
          cap_operativa: string | null
          cap_residenza_rapp_legale: string | null
          citta_legale: string | null
          citta_operativa: string | null
          citta_residenza_rapp_legale: string | null
          codice_fiscale_rapp_legale: string | null
          codice_utente_segnalatore: string | null
          cognome_rapp_legale: string | null
          comune_operativa_id: string | null
          contratto_firmato: string | null
          data_installazione_richiesta: string | null
          data_nascita_rapp_legale: string | null
          email: string | null
          id: string
          indirizzo_legale: string | null
          indirizzo_operativa: string | null
          indirizzo_residenza_rapp_legale: string | null
          luogo_nascita_rapp_legale: string | null
          nazione_legale: string | null
          nazione_operativa: string | null
          nazione_residenza_rapp_legale: string | null
          nome_locale: string | null
          nome_rapp_legale: string | null
          note: string | null
          numero_locali: number | null
          pec: string | null
          piva: string | null
          provincia_legale: string | null
          provincia_operativa: string | null
          ragione_sociale: string | null
          ranking: number | null
          ranking_confirmed: boolean | null
          regione_legale: string | null
          regione_operativa: string | null
          richiesta_stazioni: Json | null
          sdi: string | null
          segnalato_da: string | null
          stato: Database["public"]["Enums"]["stato_partner"]
          stazioni_allocate: Json | null
          telefono: string | null
          tipologia_locale_id: string | null
        }
        Insert: {
          area_id?: string | null
          cap_legale?: string | null
          cap_operativa?: string | null
          cap_residenza_rapp_legale?: string | null
          citta_legale?: string | null
          citta_operativa?: string | null
          citta_residenza_rapp_legale?: string | null
          codice_fiscale_rapp_legale?: string | null
          codice_utente_segnalatore?: string | null
          cognome_rapp_legale?: string | null
          comune_operativa_id?: string | null
          contratto_firmato?: string | null
          data_installazione_richiesta?: string | null
          data_nascita_rapp_legale?: string | null
          email?: string | null
          id?: string
          indirizzo_legale?: string | null
          indirizzo_operativa?: string | null
          indirizzo_residenza_rapp_legale?: string | null
          luogo_nascita_rapp_legale?: string | null
          nazione_legale?: string | null
          nazione_operativa?: string | null
          nazione_residenza_rapp_legale?: string | null
          nome_locale?: string | null
          nome_rapp_legale?: string | null
          note?: string | null
          numero_locali?: number | null
          pec?: string | null
          piva?: string | null
          provincia_legale?: string | null
          provincia_operativa?: string | null
          ragione_sociale?: string | null
          ranking?: number | null
          ranking_confirmed?: boolean | null
          regione_legale?: string | null
          regione_operativa?: string | null
          richiesta_stazioni?: Json | null
          sdi?: string | null
          segnalato_da?: string | null
          stato?: Database["public"]["Enums"]["stato_partner"]
          stazioni_allocate?: Json | null
          telefono?: string | null
          tipologia_locale_id?: string | null
        }
        Update: {
          area_id?: string | null
          cap_legale?: string | null
          cap_operativa?: string | null
          cap_residenza_rapp_legale?: string | null
          citta_legale?: string | null
          citta_operativa?: string | null
          citta_residenza_rapp_legale?: string | null
          codice_fiscale_rapp_legale?: string | null
          codice_utente_segnalatore?: string | null
          cognome_rapp_legale?: string | null
          comune_operativa_id?: string | null
          contratto_firmato?: string | null
          data_installazione_richiesta?: string | null
          data_nascita_rapp_legale?: string | null
          email?: string | null
          id?: string
          indirizzo_legale?: string | null
          indirizzo_operativa?: string | null
          indirizzo_residenza_rapp_legale?: string | null
          luogo_nascita_rapp_legale?: string | null
          nazione_legale?: string | null
          nazione_operativa?: string | null
          nazione_residenza_rapp_legale?: string | null
          nome_locale?: string | null
          nome_rapp_legale?: string | null
          note?: string | null
          numero_locali?: number | null
          pec?: string | null
          piva?: string | null
          provincia_legale?: string | null
          provincia_operativa?: string | null
          ragione_sociale?: string | null
          ranking?: number | null
          ranking_confirmed?: boolean | null
          regione_legale?: string | null
          regione_operativa?: string | null
          richiesta_stazioni?: Json | null
          sdi?: string | null
          segnalato_da?: string | null
          stato?: Database["public"]["Enums"]["stato_partner"]
          stazioni_allocate?: Json | null
          telefono?: string | null
          tipologia_locale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "area_station_requests"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "partner_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "aree_geografiche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "partner_segnalato_da_fkey"
            columns: ["segnalato_da"]
            isOneToOne: false
            referencedRelation: "anagrafica_utenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_segnalato_da_fkey"
            columns: ["segnalato_da"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["utente_id"]
          },
          {
            foreignKeyName: "partner_tipologia_locale_id_fkey"
            columns: ["tipologia_locale_id"]
            isOneToOne: false
            referencedRelation: "locali"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_documenti: {
        Row: {
          caricato_da: string | null
          caricato_il: string
          dimensione_file: number | null
          id: string
          nome_file: string
          partner_id: string
          tipo_documento: string
          tipo_mime: string | null
          url_file: string
        }
        Insert: {
          caricato_da?: string | null
          caricato_il?: string
          dimensione_file?: number | null
          id?: string
          nome_file: string
          partner_id: string
          tipo_documento: string
          tipo_mime?: string | null
          url_file: string
        }
        Update: {
          caricato_da?: string | null
          caricato_il?: string
          dimensione_file?: number | null
          id?: string
          nome_file?: string
          partner_id?: string
          tipo_documento?: string
          tipo_mime?: string | null
          url_file?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_documenti_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "anagrafica_utenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_documenti_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["utente_id"]
          },
          {
            foreignKeyName: "partner_documenti_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_no_area: {
        Row: {
          cap_legale: string | null
          cap_operativa: string | null
          cap_residenza_rapp_legale: string | null
          citta_legale: string | null
          citta_operativa: string | null
          citta_residenza_rapp_legale: string | null
          codice_fiscale_rapp_legale: string | null
          codice_utente_segnalatore: string | null
          cognome_rapp_legale: string | null
          comune_operativa_id: string | null
          contratto_firmato: string | null
          data_installazione_richiesta: string | null
          data_nascita_rapp_legale: string | null
          email: string | null
          id: string
          indirizzo_legale: string | null
          indirizzo_operativa: string | null
          indirizzo_residenza_rapp_legale: string | null
          luogo_nascita_rapp_legale: string | null
          nazione_legale: string | null
          nazione_operativa: string | null
          nazione_residenza_rapp_legale: string | null
          nome_locale: string | null
          nome_rapp_legale: string | null
          note: string | null
          numero_locali: number | null
          pec: string | null
          piva: string | null
          provincia_legale: string | null
          provincia_operativa: string | null
          ragione_sociale: string | null
          ranking: number | null
          ranking_confirmed: boolean | null
          regione_legale: string | null
          regione_operativa: string | null
          richiesta_stazioni: Json | null
          sdi: string | null
          segnalato_da: string | null
          stato: Database["public"]["Enums"]["stato_partner"]
          stazioni_allocate: Json | null
          telefono: string | null
          tipologia_locale_id: string | null
        }
        Insert: {
          cap_legale?: string | null
          cap_operativa?: string | null
          cap_residenza_rapp_legale?: string | null
          citta_legale?: string | null
          citta_operativa?: string | null
          citta_residenza_rapp_legale?: string | null
          codice_fiscale_rapp_legale?: string | null
          codice_utente_segnalatore?: string | null
          cognome_rapp_legale?: string | null
          comune_operativa_id?: string | null
          contratto_firmato?: string | null
          data_installazione_richiesta?: string | null
          data_nascita_rapp_legale?: string | null
          email?: string | null
          id?: string
          indirizzo_legale?: string | null
          indirizzo_operativa?: string | null
          indirizzo_residenza_rapp_legale?: string | null
          luogo_nascita_rapp_legale?: string | null
          nazione_legale?: string | null
          nazione_operativa?: string | null
          nazione_residenza_rapp_legale?: string | null
          nome_locale?: string | null
          nome_rapp_legale?: string | null
          note?: string | null
          numero_locali?: number | null
          pec?: string | null
          piva?: string | null
          provincia_legale?: string | null
          provincia_operativa?: string | null
          ragione_sociale?: string | null
          ranking?: number | null
          ranking_confirmed?: boolean | null
          regione_legale?: string | null
          regione_operativa?: string | null
          richiesta_stazioni?: Json | null
          sdi?: string | null
          segnalato_da?: string | null
          stato?: Database["public"]["Enums"]["stato_partner"]
          stazioni_allocate?: Json | null
          telefono?: string | null
          tipologia_locale_id?: string | null
        }
        Update: {
          cap_legale?: string | null
          cap_operativa?: string | null
          cap_residenza_rapp_legale?: string | null
          citta_legale?: string | null
          citta_operativa?: string | null
          citta_residenza_rapp_legale?: string | null
          codice_fiscale_rapp_legale?: string | null
          codice_utente_segnalatore?: string | null
          cognome_rapp_legale?: string | null
          comune_operativa_id?: string | null
          contratto_firmato?: string | null
          data_installazione_richiesta?: string | null
          data_nascita_rapp_legale?: string | null
          email?: string | null
          id?: string
          indirizzo_legale?: string | null
          indirizzo_operativa?: string | null
          indirizzo_residenza_rapp_legale?: string | null
          luogo_nascita_rapp_legale?: string | null
          nazione_legale?: string | null
          nazione_operativa?: string | null
          nazione_residenza_rapp_legale?: string | null
          nome_locale?: string | null
          nome_rapp_legale?: string | null
          note?: string | null
          numero_locali?: number | null
          pec?: string | null
          piva?: string | null
          provincia_legale?: string | null
          provincia_operativa?: string | null
          ragione_sociale?: string | null
          ranking?: number | null
          ranking_confirmed?: boolean | null
          regione_legale?: string | null
          regione_operativa?: string | null
          richiesta_stazioni?: Json | null
          sdi?: string | null
          segnalato_da?: string | null
          stato?: Database["public"]["Enums"]["stato_partner"]
          stazioni_allocate?: Json | null
          telefono?: string | null
          tipologia_locale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_no_area_segnalato_da_fkey"
            columns: ["segnalato_da"]
            isOneToOne: false
            referencedRelation: "anagrafica_utenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_no_area_segnalato_da_fkey"
            columns: ["segnalato_da"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["utente_id"]
          },
          {
            foreignKeyName: "partner_no_area_tipologia_locale_id_fkey"
            columns: ["tipologia_locale_id"]
            isOneToOne: false
            referencedRelation: "locali"
            referencedColumns: ["id"]
          },
        ]
      }
      stazioni: {
        Row: {
          attiva: boolean | null
          colore: string | null
          colore_id: string | null
          data_ingresso: string | null
          documenti: string | null
          documento_allegato: string | null
          fornitore: string | null
          id: string
          manutenzione: boolean | null
          modello: string | null
          modello_id: string | null
          numero_seriale: string | null
          partner_id: string | null
          slot_disponibili: number | null
          stato_stazione: string | null
        }
        Insert: {
          attiva?: boolean | null
          colore?: string | null
          colore_id?: string | null
          data_ingresso?: string | null
          documenti?: string | null
          documento_allegato?: string | null
          fornitore?: string | null
          id?: string
          manutenzione?: boolean | null
          modello?: string | null
          modello_id?: string | null
          numero_seriale?: string | null
          partner_id?: string | null
          slot_disponibili?: number | null
          stato_stazione?: string | null
        }
        Update: {
          attiva?: boolean | null
          colore?: string | null
          colore_id?: string | null
          data_ingresso?: string | null
          documenti?: string | null
          documento_allegato?: string | null
          fornitore?: string | null
          id?: string
          manutenzione?: boolean | null
          modello?: string | null
          modello_id?: string | null
          numero_seriale?: string | null
          partner_id?: string | null
          slot_disponibili?: number | null
          stato_stazione?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stazioni_colore_id_fkey"
            columns: ["colore_id"]
            isOneToOne: false
            referencedRelation: "colori_stazione"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stazioni_modello_id_fkey"
            columns: ["modello_id"]
            isOneToOne: false
            referencedRelation: "modelli_stazione"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stazioni_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner"
            referencedColumns: ["id"]
          },
        ]
      }
      utente_area: {
        Row: {
          area_id: string
          utente_id: string
        }
        Insert: {
          area_id: string
          utente_id: string
        }
        Update: {
          area_id?: string
          utente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "utente_area_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "area_station_requests"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "utente_area_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "aree_geografiche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utente_area_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "utente_area_utente_id_fkey"
            columns: ["utente_id"]
            isOneToOne: false
            referencedRelation: "anagrafica_utenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utente_area_utente_id_fkey"
            columns: ["utente_id"]
            isOneToOne: false
            referencedRelation: "vw_utenti_aree"
            referencedColumns: ["utente_id"]
          },
        ]
      }
    }
    Views: {
      area_station_requests: {
        Row: {
          area_id: string | null
          area_nome: string | null
          regione: Database["public"]["Enums"]["regione_italiana"] | null
          stazioni_richieste: number | null
        }
        Relationships: []
      }
      vw_utenti_aree: {
        Row: {
          area_id: string | null
          area_nome: string | null
          cognome: string | null
          email: string | null
          nome: string | null
          regione: Database["public"]["Enums"]["regione_italiana"] | null
          ruolo: Database["public"]["Enums"]["ruolo_utente"] | null
          utente_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      regione_italiana:
        | "Abruzzo"
        | "Basilicata"
        | "Calabria"
        | "Campania"
        | "Emilia-Romagna"
        | "Friuli-Venezia Giulia"
        | "Lazio"
        | "Liguria"
        | "Lombardia"
        | "Marche"
        | "Molise"
        | "Piemonte"
        | "Puglia"
        | "Sardegna"
        | "Sicilia"
        | "Toscana"
        | "Trentino-Alto Adige"
        | "Umbria"
        | "Valle d'Aosta"
        | "Veneto"
      ruolo_utente:
        | "SuperAdmin"
        | "Master"
        | "Gestore"
        | "Ambassador"
        | "Agenzia"
      stato_partner:
        | "CONTATTO"
        | "APPROVATO"
        | "SELEZIONATO"
        | "ALLOCATO"
        | "CONTRATTUALIZZATO"
        | "PERSO"
        | "ATTIVO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      regione_italiana: [
        "Abruzzo",
        "Basilicata",
        "Calabria",
        "Campania",
        "Emilia-Romagna",
        "Friuli-Venezia Giulia",
        "Lazio",
        "Liguria",
        "Lombardia",
        "Marche",
        "Molise",
        "Piemonte",
        "Puglia",
        "Sardegna",
        "Sicilia",
        "Toscana",
        "Trentino-Alto Adige",
        "Umbria",
        "Valle d'Aosta",
        "Veneto",
      ],
      ruolo_utente: [
        "SuperAdmin",
        "Master",
        "Gestore",
        "Ambassador",
        "Agenzia",
      ],
      stato_partner: [
        "CONTATTO",
        "APPROVATO",
        "SELEZIONATO",
        "ALLOCATO",
        "CONTRATTUALIZZATO",
        "PERSO",
        "ATTIVO",
      ],
    },
  },
} as const
