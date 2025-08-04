-- Reset MEO PINELLI partner status to CONTRATTUALIZZATO
UPDATE partner 
SET stato = 'CONTRATTUALIZZATO'
WHERE nome_locale = 'Meo Pinelli';