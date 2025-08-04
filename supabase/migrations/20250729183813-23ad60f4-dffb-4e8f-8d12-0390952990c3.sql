-- Reset MEO PINELLI to CONTRATTUALIZZATO state and clean up associated stations and documents

-- First, let's check what we have for MEO PINELLI
DO $$
DECLARE
    partner_record RECORD;
    stazioni_count INTEGER;
    documenti_count INTEGER;
BEGIN
    -- Get partner info
    SELECT * INTO partner_record FROM partner WHERE nome_locale = 'Meo Pinelli';
    
    IF partner_record.id IS NOT NULL THEN
        -- Count associated stations
        SELECT COUNT(*) INTO stazioni_count FROM stazioni WHERE partner_id = partner_record.id;
        
        -- Count associated documents
        SELECT COUNT(*) INTO documenti_count FROM partner_documenti WHERE partner_id = partner_record.id AND tipo_documento = 'posizionamento_stazione';
        
        RAISE NOTICE 'Partner: % (ID: %)', partner_record.nome_locale, partner_record.id;
        RAISE NOTICE 'Current status: %', partner_record.stato;
        RAISE NOTICE 'Associated stations: %', stazioni_count;
        RAISE NOTICE 'Station documents: %', documenti_count;
        
        -- Delete station documents first
        DELETE FROM partner_documenti 
        WHERE partner_id = partner_record.id 
        AND tipo_documento = 'posizionamento_stazione';
        
        -- Delete associated stations
        DELETE FROM stazioni WHERE partner_id = partner_record.id;
        
        -- Reset partner status to CONTRATTUALIZZATO
        UPDATE partner 
        SET stato = 'CONTRATTUALIZZATO'
        WHERE id = partner_record.id;
        
        RAISE NOTICE 'Successfully reset MEO PINELLI to CONTRATTUALIZZATO and cleaned up % stations and % documents', stazioni_count, documenti_count;
    ELSE
        RAISE NOTICE 'Partner MEO PINELLI not found';
    END IF;
END $$;