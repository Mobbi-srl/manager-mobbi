-- Reset Antico Frantoio "La Femminuccia" Google Places fields and set status to CONTRATTUALIZZATO for testing
UPDATE partner 
SET 
  latitude = NULL,
  longitude = NULL,
  phone_number_google = NULL,
  place_id_g_place = NULL,
  img_url_gplace1 = NULL,
  img_url_gplace2 = NULL,
  weekday_text = NULL,
  stato = 'CONTRATTUALIZZATO'::stato_partner
WHERE nome_locale = 'Antico Frantoio "La Femminuccia"';