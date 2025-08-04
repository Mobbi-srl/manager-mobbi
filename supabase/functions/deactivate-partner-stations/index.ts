import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LYTE_API_TOKEN = Deno.env.get('LYTE_API_TOKEN');
    
    if (!LYTE_API_TOKEN) {
      console.error("❌ LYTE_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'LYTE API token not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { serialNumbers } = await req.json();
    
    if (!serialNumbers || !Array.isArray(serialNumbers)) {
      console.error("❌ Invalid serial numbers provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Serial numbers array is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔄 Moving ${serialNumbers.length} stations from Production to New Warehouse`);

    const results = [];
    
    for (const serialNumber of serialNumbers) {
      try {
        console.log(`🔄 Processing station ${serialNumber}...`);
        
        // Step 1: Move station to New Warehouse in Lyte system
        const lytePayload = {
          token: LYTE_API_TOKEN,
          kiosk_sn: serialNumber,
          inside_location: "", // Location vuota per rimuovere l'associazione partner
          venue_name: "[Mobbi] New Warehouse" // Sposta al warehouse
        };

        console.log(`📤 Moving station ${serialNumber} to New Warehouse:`, JSON.stringify(lytePayload, null, 2));

        const lyteResponse = await fetch('https://prod.api.lyte.city/api/v1/kiosk/venue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lytePayload)
        });

        let lyteSuccess = false;
        let lyteError = '';
        
        if (lyteResponse.ok) {
          console.log(`✅ Successfully moved station ${serialNumber} to New Warehouse`);
          lyteSuccess = true;
        } else {
          const errorText = await lyteResponse.text();
          console.error(`❌ Failed to move station ${serialNumber}:`, errorText);
          lyteError = `Lyte API: HTTP ${lyteResponse.status}: ${errorText}`;
        }

        // Step 2: Reset merchant in Mobbi system
        console.log(`📤 Resetting merchant for station ${serialNumber}...`);
        
        const merchantPayload = {
          imei: serialNumber
        };

        const merchantResponse = await fetch('https://console.mobbi.it/api/v1/merchants/resetMerchantByNewSystem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(merchantPayload)
        });

        let merchantSuccess = false;
        let merchantError = '';
        
        if (merchantResponse.ok) {
          console.log(`✅ Successfully reset merchant for station ${serialNumber}`);
          merchantSuccess = true;
        } else {
          const errorText = await merchantResponse.text();
          console.error(`❌ Failed to reset merchant for station ${serialNumber}:`, errorText);
          merchantError = `Merchant API: HTTP ${merchantResponse.status}: ${errorText}`;
        }

        // Combine results
        const overallSuccess = lyteSuccess && merchantSuccess;
        const errors = [lyteError, merchantError].filter(e => e).join('; ');
        
        if (overallSuccess) {
          results.push({
            serialNumber,
            success: true,
            message: 'Station moved to New Warehouse and merchant reset successfully'
          });
        } else {
          results.push({
            serialNumber,
            success: false,
            error: errors || 'Unknown error'
          });
        }
      } catch (error) {
        console.error(`❌ Error moving station ${serialNumber}:`, error);
        results.push({
          serialNumber,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`📊 Results: ${successCount} success, ${failureCount} failures`);

    return new Response(
      JSON.stringify({
        success: failureCount === 0,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failures: failureCount
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("❌ Error in deactivate-partner-stations:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});