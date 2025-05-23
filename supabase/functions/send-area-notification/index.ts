
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { area } = await req.json();
    console.log("Ricevuta richiesta di notifica per area:", area);

    // Ottieni tutti gli utenti con i ruoli specificati
    const { data: users, error: usersError } = await supabase
      .from("anagrafica_utenti")
      .select("email, nome, cognome")
      .in("ruolo", ["Gestore", "Ambassador", "Agenzia"]);

    if (usersError) {
      throw usersError;
    }

    console.log(`Trovati ${users?.length || 0} utenti da notificare`);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nessun utente da notificare" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Invia email a tutti gli utenti
    const emailPromises = users.map((user) =>
      resend.emails.send({
        from: "Mobbi <info@management.mobbi.it>",
        to: [user.email],
        subject: "Nuova Area Geografica Attivata",
        html: `
          <p>Gentile ${user.nome} ${user.cognome},</p>
          <p>La direzione MOBBI ti informa che è stata aggiunta una nuova area geografica:</p>
          <ul>
            <li><strong>Nome:</strong> ${area.nome}</li>
            <li><strong>Regione:</strong> ${area.regione}</li>
            <li><strong>Città:</strong> ${area.capoluoghi.map((c: any) => c.nome).join(", ")}</li>
            ${area.descrizione ? `<li><strong>Descrizione:</strong> ${area.descrizione}</li>` : ""}
          </ul>
          <p>Da adesso sarà a disposizione nelle tue aree geografiche.</p>
          <p>Cordiali saluti,<br>Il team Mobbi</p>
        `
      })
    );

    const results = await Promise.all(emailPromises);
    console.log("Email inviate con successo:", results.length);

    return new Response(
      JSON.stringify({ message: `${results.length} email inviate con successo` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Errore nell'invio delle email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
