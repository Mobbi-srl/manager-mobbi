-- Reset MEO PINELLI partner status to CONTRATTUALIZZATO for testing Google Places fallback
UPDATE partner 
SET stato = 'CONTRATTUALIZZATO'
WHERE nome_locale = 'Meo Pinelli';