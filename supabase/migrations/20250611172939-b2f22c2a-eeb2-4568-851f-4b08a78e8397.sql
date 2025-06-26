
-- Prima eliminiamo i dati esistenti dalle tabelle correlate
DELETE FROM aree_capoluoghi;
DELETE FROM capoluoghi;
DELETE FROM comuni_italiani;

-- Ricreiamo la tabella comuni_italiani con la struttura corretta per contenere tutti i dati
DROP TABLE IF EXISTS comuni_italiani CASCADE;
CREATE TABLE comuni_italiani (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  provincia text NOT NULL,
  regione regione_italiana NOT NULL,
  sigla_provincia text NOT NULL,
  codice_catastale text,
  cap text,
  prefisso text,
  coordinate_lat numeric,
  coordinate_lng numeric,
  is_capoluogo boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Ricreiamo anche la tabella capoluoghi
DELETE FROM capoluoghi;

-- Creiamo gli indici per migliorare le performance delle query
CREATE INDEX idx_comuni_provincia ON comuni_italiani(provincia);
CREATE INDEX idx_comuni_regione ON comuni_italiani(regione);
CREATE INDEX idx_comuni_sigla ON comuni_italiani(sigla_provincia);
CREATE INDEX idx_comuni_nome ON comuni_italiani(nome);
CREATE INDEX idx_comuni_codice_catastale ON comuni_italiani(codice_catastale);

-- Abilita RLS per sicurezza (opzionale)
ALTER TABLE comuni_italiani ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to comuni" ON comuni_italiani FOR SELECT USING (true);
