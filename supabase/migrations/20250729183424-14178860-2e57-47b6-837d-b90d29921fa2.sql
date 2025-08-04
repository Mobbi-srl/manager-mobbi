-- Reset MEO PINELLI partner status to CONTRATTUALIZZATO for testing the new Google Places fallback system
UPDATE partner 
SET stato = 'CONTRATTUALIZZATO'
WHERE nome_locale = 'Meo Pinelli';