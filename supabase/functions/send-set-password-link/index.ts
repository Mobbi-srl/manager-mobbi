
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Get environment variables
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "re_g3MWL2i4_4YJuH8yNZd7XfNTW8bU99LdU";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize clients
const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to delay execution (for simulating work)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Edge function invocata");
    const { email } = await req.json();

    if (!email) {
      console.error("Email mancante nella richiesta");
      throw new Error("Email mancante nella richiesta");
    }

    console.log("Verifico utente:", email);

    // Verifica l'esistenza dell'email nel database
    const { data: userRecord, error: userError } = await supabase
      .from('anagrafica_utenti')
      .select('id, email, nome, cognome, ruolo')
      .eq('email', email)
      .single();

    if (userError || !userRecord) {
      console.error("Errore o utente non trovato:", userError);
      return new Response(JSON.stringify({
        error: "Utente inesistente",
        message: "Nessun account trovato con questa email."
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    console.log("Utente trovato:", userRecord);

    try {
      // Prima verifichiamo se l'utente esiste già in auth
      const { data: authUser, error: findAuthError } = await supabase.auth.admin.listUsers({
        perPage: 1,
        filter: {
          email: email
        }
      });

      let userId = userRecord.id;

      // Se l'utente non esiste in auth, dobbiamo crearlo
      if (findAuthError || !authUser || authUser.users.length === 0) {
        console.log("Utente non trovato in auth, lo creo ora");

        // Crea l'utente in auth con una password temporanea casuale
        const tempPassword = Array(16).fill(0).map(() => Math.random().toString(36).charAt(2)).join('');
        const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            nome: userRecord.nome,
            cognome: userRecord.cognome,
            ruolo: userRecord.ruolo
          }
        });

        if (createError || !newAuthUser) {
          console.error("Errore nella creazione dell'utente in auth:", createError);
          throw new Error("Impossibile creare l'utente in auth");
        }

        userId = newAuthUser.user.id;

        // Aggiorniamo l'ID in anagrafica_utenti per mantenere la coerenza
        const { error: updateError } = await supabase
          .from('anagrafica_utenti')
          .update({ id: userId })
          .eq('id', userRecord.id);

        if (updateError) {
          console.warn("Avviso: impossibile aggiornare l'ID utente in anagrafica, ma l'utente è stato creato in auth:", updateError);
        }
      }

      // Costruisci l'URL per la nuova password con l'email
      const baseUrl = req.headers.get("origin") || "https://mobbi-management.vercel.app";
      const passwordSetupUrl = `${baseUrl}/nuova-password?email=${encodeURIComponent(email)}`;

      console.log("URL per impostazione password:", passwordSetupUrl);

      // Invia email per impostazione password
      console.log("Tentativo di invio email per reset password a:", email);
      
      const emailResponse = await resend.emails.send({
        from: "Mobbi <info@management.mobbi.it>",
        to: [email],
        subject: "Imposta la tua password - Manager Mobbi",
        html: `
          <h2>Imposta la tua Password per Manager Mobbi</h2>
          <p>Ciao ${userRecord.nome || ""},</p>
          <p>Hai richiesto di impostare una nuova password per il tuo account Manager Mobbi.</p>
          <p>Per impostare la tua password, clicca sul link seguente:</p>
          <p><a href="${passwordSetupUrl}" style="padding: 15px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Imposta Password</a></p>
          <p>Oppure copia e incolla questo link nel tuo browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all;">${passwordSetupUrl}</p>
          <p>Questo link scadrà dopo 24 ore per motivi di sicurezza.</p>
          <p>Se non hai richiesto questo reset password, puoi ignorare questa email.</p>
          <p>Grazie,<br>Il team di Mobbi</p>
        `
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Email per impostazione password inviata con successo."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } catch (error) {
      console.error("Errore durante l'invio dell'email:", error);

      // Gestione specifica per rate limiting di Resend
      if (error.statusCode === 429 || error.message?.includes("rate limit")) {
        return new Response(JSON.stringify({
          error: "Troppe richieste di invio email",
          message: "Troppe richieste di invio email. Attendere qualche minuto e riprovare."
        }), {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // Gestione specifica per timeout
      if (error.statusCode === 504 || error.message?.includes("timeout")) {
        return new Response(JSON.stringify({
          error: "Timeout del server",
          message: "Il server ha impiegato troppo tempo a rispondere. Riprova tra qualche momento."
        }), {
          status: 504,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Errore nell'edge function:", error);
    return new Response(JSON.stringify({
      error: error.message,
      name: error.name || "",
      status: error.status || 500
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
