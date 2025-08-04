// Google Places Fallback Edge Function - Simplified for testing
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Google Places Fallback function started - SIMPLIFIED VERSION');

    const { partnerName, address } = await req.json();
    console.log(`📍 Request received for: ${partnerName} at ${address}`);
    
    if (!partnerName || !address) {
      throw new Error('Partner name and address are required');
    }

    // Check if API key is available
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    console.log('🔑 Google Maps API Key available:', !!GOOGLE_MAPS_API_KEY);
    console.log('🔑 Google Maps API Key length:', GOOGLE_MAPS_API_KEY?.length || 0);
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API key not configured in environment');
      // Return mock data in correct format for client with sample images
      const mockData = {
        latitude: 41.8902,
        longitude: 12.4922,
        phone_number_google: "+39 06 1234567",
        place_id_g_place: "ChIJTest123MockPlaceId",
        img_url_gplace1: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        img_url_gplace2: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        weekday_text: [
          "Monday: 9:00 AM – 6:00 PM",
          "Tuesday: 9:00 AM – 6:00 PM",
          "Wednesday: 9:00 AM – 6:00 PM",
          "Thursday: 9:00 AM – 6:00 PM",
          "Friday: 9:00 AM – 6:00 PM",
          "Saturday: 10:00 AM – 4:00 PM",
          "Sunday: Closed"
        ]
      };
      
      console.log('⚠️ Using mock data due to missing API key:', mockData);
      
      return new Response(
        JSON.stringify({ success: true, data: mockData, isMock: true }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log('✅ API key found, proceeding with real Google Places API call');

    // Step 1: Text Search to find the place
    const searchQuery = `${partnerName} ${address}`;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('📍 Calling Google Places Text Search API');
    const textSearchResponse = await fetch(textSearchUrl);
    const textSearchData = await textSearchResponse.json();

    console.log('📍 Text Search Response Status:', textSearchData.status);
    console.log('📍 Text Search Results Count:', textSearchData.results?.length || 0);

    if (textSearchData.status !== 'OK' || !textSearchData.results?.length) {
      console.log('⚠️ No results found in Text Search, using mock data');
      const mockData = {
        latitude: 41.8902,
        longitude: 12.4922,
        phone_number_google: "+39 06 1234567",
        place_id_g_place: "ChIJTest123MockPlaceId",
        img_url_gplace1: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        img_url_gplace2: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        weekday_text: []
      };
      
      return new Response(
        JSON.stringify({ success: true, data: mockData, isMock: true }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const place = textSearchData.results[0];
    console.log(`✅ Found place: ${place.name} with place_id: ${place.place_id}`);

    // Step 2: Get detailed information using Place Details API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry,formatted_phone_number,opening_hours,photos&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('📋 Calling Google Places Details API');
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    console.log('📋 Details Response Status:', detailsData.status);

    if (detailsData.status !== 'OK') {
      console.log('⚠️ Error getting place details, using basic data');
      const basicData = {
        latitude: place.geometry?.location?.lat || 0,
        longitude: place.geometry?.location?.lng || 0,
        phone_number_google: "",
        place_id_g_place: place.place_id || "",
        img_url_gplace1: "",
        img_url_gplace2: "",
        weekday_text: []
      };
      
      return new Response(
        JSON.stringify({ success: true, data: basicData, isBasic: true }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const details = detailsData.result;
    
    // Normalize the data in the correct format for client
    const photos = details.photos 
      ? details.photos.slice(0, 2).map(photo => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        )
      : [];
    
    const fallbackData = {
      latitude: details.geometry?.location?.lat || 0,
      longitude: details.geometry?.location?.lng || 0,
      phone_number_google: details.formatted_phone_number || "",
      place_id_g_place: place.place_id || "",
      img_url_gplace1: photos[0] || "",
      img_url_gplace2: photos[1] || "",
      weekday_text: details.opening_hours?.weekday_text || []
    };

    console.log('✅ Real fallback data retrieved:', {
      latitude: fallbackData.latitude,
      longitude: fallbackData.longitude,
      phone: fallbackData.phone_number_google,
      placeId: fallbackData.place_id_g_place,
      photos: [fallbackData.img_url_gplace1, fallbackData.img_url_gplace2].filter(Boolean).length,
      openingHours: fallbackData.weekday_text.length
    });

    return new Response(
      JSON.stringify({ success: true, data: fallbackData, isReal: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in Google Places fallback:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});