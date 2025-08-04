import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get LYTE API token from environment (stored as secret)
const LYTE_API_TOKEN = Deno.env.get('LYTE_API_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check if LYTE API token is configured
    if (!LYTE_API_TOKEN) {
      console.error("LYTE_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ 
          error: 'Configurazione API mancante. Contattare l\'amministratore.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { stations, partnerName } = await req.json()

    console.log('🚀 Starting partner activation for stations:', stations)
    console.log('🏢 Partner name:', partnerName)

    const results = []

    // Esegui le chiamate per ogni stazione
    for (const station of stations) {
      const { numero_seriale } = station

      if (!numero_seriale) {
        throw new Error(`Numero seriale mancante per la stazione ${station.modello}`)
      }

      const lytePayload = {
        token: LYTE_API_TOKEN,
        kiosk_sn: numero_seriale,
        inside_location: partnerName,
        venue_name: "[Mobbi] Production 2"
      }

      console.log(`🔧 Calling LYTE API for station ${numero_seriale}:`, lytePayload)

      try {
        const lyteResponse = await fetch('https://prod.api.lyte.city/api/v1/kiosk/venue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lytePayload)
        })

        if (!lyteResponse.ok) {
          const errorText = await lyteResponse.text()
          throw new Error(`LYTE API error for station ${numero_seriale}: ${lyteResponse.status} - ${errorText}`)
        }

        const lyteResult = await lyteResponse.json()
        console.log(`✅ LYTE API success for station ${numero_seriale}:`, lyteResult)

        results.push({
          numero_seriale,
          success: true,
          result: lyteResult
        })

      } catch (error) {
        console.error(`❌ LYTE API error for station ${numero_seriale}:`, error)
        throw new Error(`Errore nella configurazione della stazione ${numero_seriale}: ${error.message}`)
      }
    }

    console.log('✅ All stations configured successfully:', results)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tutte le stazioni sono state configurate con successo',
        results 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Error in activate-partner-stations:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Errore nella configurazione delle stazioni' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})