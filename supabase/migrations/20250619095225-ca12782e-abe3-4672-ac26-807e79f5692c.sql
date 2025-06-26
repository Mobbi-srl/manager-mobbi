
-- Sposta i partner senza area dalla tabella partner alla tabella partner_no_area
INSERT INTO partner_no_area (
  id, ragione_sociale, nome_locale, indirizzo_operativa, citta_operativa, 
  provincia_operativa, regione_operativa, cap_operativa, nazione_operativa,
  indirizzo_legale, citta_legale, provincia_legale, regione_legale, 
  cap_legale, nazione_legale, piva, sdi, numero_locali, ranking, 
  tipologia_locale_id, richiesta_stazioni, stato, ranking_confirmed, 
  stazioni_allocate, segnalato_da, codice_utente_segnalatore, telefono, 
  email, pec, nome_rapp_legale, cognome_rapp_legale, data_nascita_rapp_legale,
  luogo_nascita_rapp_legale, indirizzo_residenza_rapp_legale, 
  cap_residenza_rapp_legale, citta_residenza_rapp_legale, 
  nazione_residenza_rapp_legale, codice_fiscale_rapp_legale, 
  contratto_firmato, note, comune_operativa_id, data_installazione_richiesta
)
SELECT 
  id, ragione_sociale, nome_locale, indirizzo_operativa, citta_operativa, 
  provincia_operativa, regione_operativa, cap_operativa, nazione_operativa,
  indirizzo_legale, citta_legale, provincia_legale, regione_legale, 
  cap_legale, nazione_legale, piva, sdi, numero_locali, ranking, 
  tipologia_locale_id, richiesta_stazioni, stato, ranking_confirmed, 
  stazioni_allocate, segnalato_da, codice_utente_segnalatore, telefono, 
  email, pec, nome_rapp_legale, cognome_rapp_legale, data_nascita_rapp_legale,
  luogo_nascita_rapp_legale, indirizzo_residenza_rapp_legale, 
  cap_residenza_rapp_legale, citta_residenza_rapp_legale, 
  nazione_residenza_rapp_legale, codice_fiscale_rapp_legale, 
  contratto_firmato, note, comune_operativa_id, data_installazione_richiesta
FROM partner 
WHERE id IN ('46390e49-a5dc-41d3-9b27-71d54c44c670', 'c1ed1f33-0bf7-40e9-af11-4aaf4a827ad0')
  AND area_id IS NULL;

-- Sposta i contatti dalla tabella contatti alla tabella contatti_no_area
INSERT INTO contatti_no_area (id, nome, cognome, ruolo, email, numero, partner_id)
SELECT id, nome, cognome, ruolo, email, numero, partner_id
FROM contatti
WHERE partner_id IN ('46390e49-a5dc-41d3-9b27-71d54c44c670', 'c1ed1f33-0bf7-40e9-af11-4aaf4a827ad0');

-- Rimuovi le relazioni area_partner se esistono
DELETE FROM area_partner 
WHERE partner_id IN ('46390e49-a5dc-41d3-9b27-71d54c44c670', 'c1ed1f33-0bf7-40e9-af11-4aaf4a827ad0');

-- Rimuovi i contatti dalla tabella contatti
DELETE FROM contatti 
WHERE partner_id IN ('46390e49-a5dc-41d3-9b27-71d54c44c670', 'c1ed1f33-0bf7-40e9-af11-4aaf4a827ad0');

-- Rimuovi i partner dalla tabella partner
DELETE FROM partner 
WHERE id IN ('46390e49-a5dc-41d3-9b27-71d54c44c670', 'c1ed1f33-0bf7-40e9-af11-4aaf4a827ad0')
  AND area_id IS NULL;
