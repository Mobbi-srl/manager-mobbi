-- Configure Google Maps API key as secret for the google-places-fallback edge function
-- This uses the same key that's already configured for autocomplete in index.html
SELECT vault.create_secret('AIzaSyARkEW4kDEv6fnNbf8E6XZmtGy0dfQ2AUc', 'GOOGLE_MAPS_API_KEY', 'Google Maps API key for Places API fallback');