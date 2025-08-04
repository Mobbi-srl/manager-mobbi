-- Reset MEO PINELLI partner per test del fallback Google Places
-- 1. Rimuovi la stazione dalla tabella stazioni
DELETE FROM stazioni WHERE numero_seriale = 'MBIH062302870060';

-- 2. Rimuovi i documenti di posizionamento stazione per MEO PINELLI
DELETE FROM partner_documenti WHERE partner_id = 'ea4539af-ca31-4037-bdd7-6a02d8ad76b9' AND tipo_documento = 'posizionamento_stazione';

-- 3. Riporta MEO PINELLI allo stato CONTRATTUALIZZATO e rimuovi le stazioni allocate
UPDATE partner 
SET stato = 'CONTRATTUALIZZATO', 
    stazioni_allocate = '[]'::jsonb 
WHERE id = 'ea4539af-ca31-4037-bdd7-6a02d8ad76b9';