
-- Aggiorna le policy RLS per la tabella comuni_italiani per permettere l'inserimento pubblico
-- Rimuovi la policy esistente se esiste
DROP POLICY IF EXISTS "Allow public read access to comuni" ON comuni_italiani;

-- Crea una policy più permissiva per lettura
CREATE POLICY "Allow public read access to comuni" ON comuni_italiani FOR SELECT USING (true);

-- Aggiungi policy per permettere inserimento (necessario per l'importazione)
CREATE POLICY "Allow public insert access to comuni" ON comuni_italiani FOR INSERT WITH CHECK (true);

-- Anche per i capoluoghi
ALTER TABLE capoluoghi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to capoluoghi" ON capoluoghi FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to capoluoghi" ON capoluoghi FOR INSERT WITH CHECK (true);
