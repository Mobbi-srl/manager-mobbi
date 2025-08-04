import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Headers CORS corretti
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Get LYTE API token from environment (stored as secret)
const LYTE_API_TOKEN = Deno.env.get('LYTE_API_TOKEN');

interface KioskData {
  kiosk_sn: string;
  inside_location: string;
  pos_sn: string;
  app_version: string;
  last_heartbeat: number;
  status: number;
  bluetooth_status: number;
  bt_status: number;
  pos_status: number;
  available_slots: number;
  total_slots: number;
  empty_slots: number;
  charger_list: any[];
  qr_code_url: string;
}

interface VenueData {
  name: string;
  location: {
    country: string;
    state: string;
    city: string;
    street: string;
    postcode: string;
    lat: number;
    lng: number;
  };
  opening_hours: any;
  kiosks: KioskData[];
}

interface ApiResponse {
  code: number;
  msg: string;
  errInfo: string;
  data: {
    has_more: boolean;
    total_page: number;
    venues_list: VenueData[];
  };
}

// Cache globale per i numeri seriali
let cachedSerials: string[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore in millisecondi

serve(async (req) => {
  // Gestisci preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Controlla se abbiamo una cache valida
  const now = Date.now();
  if (cachedSerials && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log("Returning cached serial numbers");
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: cachedSerials,
        cached: true,
        cacheAge: now - cacheTimestamp
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  }

  try {
    // Check if LYTE API token is configured
    if (!LYTE_API_TOKEN) {
      console.error("LYTE_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API configuration missing' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Fetching fresh data from Lyte API");
    
    // Chiama l'API esterna
    const response = await fetch("https://prod.api.lyte.city/api/v1/venue/listall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: LYTE_API_TOKEN,
        page_num: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (data.code !== 0) {
      throw new Error(data.errInfo || "API returned error");
    }

    // Filtra per venue con name "[Mobbi] New Warehouse"
    const targetVenue = data.data.venues_list.find(
      venue => venue.name === "[Mobbi] New Warehouse"
    );

    if (!targetVenue) {
      console.log("Target venue not found, returning empty array");
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          message: "Target venue '[Mobbi] New Warehouse' not found"
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        }
      );
    }

    // Estrai tutti i kiosk_sn dai kiosk della venue, filtrando valori vuoti
    const serialNumbers = targetVenue.kiosks
      .map(kiosk => kiosk.kiosk_sn)
      .filter(sn => sn && sn.trim() !== "");

    // Aggiorna la cache
    cachedSerials = serialNumbers;
    cacheTimestamp = now;

    console.log(`Found ${serialNumbers.length} serial numbers, cached for future requests`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: serialNumbers,
        cached: false,
        count: serialNumbers.length
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );

  } catch (error) {
    console.error("Error fetching kiosk data:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        data: []
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  }
});