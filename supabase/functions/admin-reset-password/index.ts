
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email e password sono obbligatori" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // First check if user exists in anagrafica_utenti
    const { data: userData, error: userError } = await supabaseAdmin
      .from('anagrafica_utenti')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error("Errore durante la verifica dell'utente:", userError);
      return new Response(
        JSON.stringify({ error: "Errore durante la verifica dell'utente" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!userData) {
      return new Response(
        JSON.stringify({ error: "UTENTE NON PRESENTE" }),
        {
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find user by email
    const { data: users, error: findError } = await supabaseAdmin.auth.admin
      .listUsers({
        perPage: 1000 // Ensure we get all users to search through
      });
    
    if (findError) {
      console.error("Errore durante la ricerca dell'utente:", findError);
      return new Response(
        JSON.stringify({ error: "Errore durante la ricerca dell'utente" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userAccount = users?.users.find(u => u.email === email);

    if (!userAccount) {
      return new Response(
        JSON.stringify({ error: "Account non trovato" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update the password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userAccount.id,
      { password }
    );

    if (updateError) {
      console.error("Errore durante l'aggiornamento della password:", updateError);
      return new Response(
        JSON.stringify({ error: "Errore durante l'aggiornamento della password" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "PASSWORD AGGIORNATA CON SUCCESSO" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Errore imprevisto:", error);
    return new Response(
      JSON.stringify({ error: "Si è verificato un errore imprevisto" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
