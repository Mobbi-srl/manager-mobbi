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
    console.log('🔍 Function started successfully');
    
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return new Response(
        JSON.stringify({ error: 'Only POST method is allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔍 About to parse request body');
    let requestBody: any;
    try {
      requestBody = await req.json();
      console.log('✅ Request body parsed:', requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Basic validation
    if (!requestBody.name) {
      console.error('❌ Missing required field: name');
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📤 Sending data to console.mobbi.it:', {
      name: requestBody.name,
      address: requestBody.address,
      lat: requestBody.lat,
      long: requestBody.long
    });

    // Send data to external API
    try {
      const response = await fetch('https://console.mobbi.it/api/v1/merchants/saveMerchantDataByNewSystem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mobbi-System/1.0',
        },
        body: JSON.stringify({
          name: requestBody.name,
          deviceType: requestBody.deviceType || 'LYTE',
          lat: requestBody.lat,
          lng: requestBody.lng,
          tel: requestBody.tel,
          address: requestBody.address,
          weekday_text: requestBody.weekday_text,
          placeId: requestBody.placeId,
          img1UrlGoogle: requestBody.img1UrlGoogle,
          img2UrlGoogle: requestBody.img2UrlGoogle,
          imei: requestBody.imei,
          _timestamp: new Date().toISOString(),
          _source: 'supabase-edge-function'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ External API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'External API error', 
            status: response.status,
            details: response.statusText
          }),
          { 
            status: 502, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const responseData = await response.json();
      console.log("✅ Success:", responseData);

      return new Response(JSON.stringify({
        success: true,
        data: responseData,
        message: "Merchant data sent successfully"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      console.error('❌ Network error:', fetchError.message);
      
      return new Response(JSON.stringify({
        error: 'Failed to connect to external service',
        details: fetchError.message
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});