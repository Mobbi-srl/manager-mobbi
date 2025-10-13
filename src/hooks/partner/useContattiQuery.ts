
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../auth";
import { useUserAreas } from "../users/useUserAreas";
import { useUserProfile } from "../useUserProfile";

export const useContattiQuery = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const userRole = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isGestore = userRole === "Gestore";
  
  // Get user areas if the user is a Gestore
  const { data: userAreas } = useUserAreas(isGestore ? user?.id : undefined);
  const areaIds = Array.isArray(userAreas) ? userAreas.map(a => a.id).filter(Boolean) : [];

  return useQuery({
    queryKey: ["contatti", userRole, user?.id, ...(areaIds || [])],
    queryFn: async () => {
      console.log("🔍 Fetching contatti with user role:", userRole);
      
      // Build the query to include all necessary partner fields
      let query = supabase
        .from("contatti")
        .select(`
          id,
          nome,
          cognome,
          ruolo,
          email,
          numero,
          partner:partner_id (
            id,
            ragione_sociale,
            nome_locale,
            stato,
            area_id,
            segnalato_da,
            ranking,
            ranking_confirmed,
            richiesta_stazioni,
            stazioni_allocate,
            indirizzo_operativa,
            citta_operativa,
            provincia_operativa,
            regione_operativa,
            cap_operativa,
            nazione_operativa,
            indirizzo_legale,
            citta_legale,
            provincia_legale,
            regione_legale,
            cap_legale,
            nazione_legale,
            telefono,
            email,
            pec,
            piva,
            sdi,
            numero_locali,
            note,
            nome_rapp_legale,
            cognome_rapp_legale,
            data_nascita_rapp_legale,
            luogo_nascita_rapp_legale,
            codice_fiscale_rapp_legale,
            indirizzo_residenza_rapp_legale,
            cap_residenza_rapp_legale,
            citta_residenza_rapp_legale,
            nazione_residenza_rapp_legale,
            latitude,
            longitude,
            phone_number_google,
            weekday_text,
            place_id_g_place,
            img_url_gplace1,
            img_url_gplace2,
            area:area_id (
              id,
              nome,
              regione
            ),
            tipologia_locale:tipologia_locale_id (
              id,
              tipologia
            )
          )
        `)
        .not("partner_id", "is", null);

      // Escludi i partner senza area da questa sezione (verranno mostrati nel tab dedicato)
      // Nota: il filtro sul join va scritto come "partner.area_id"
      query = query.not("partner.area_id", "is", null);

      // Se l'utente è Gestore, limita ulteriormente alle sue aree assegnate (client-side guard oltre alle RLS)
      if (isGestore && areaIds.length > 0) {
        query = query.in("partner.area_id", areaIds as string[]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error fetching contatti:", error);
        throw error;
      }

      // Process the data to handle JSON fields properly
      const processedData = data?.map(contatto => ({
        ...contatto,
        partner: contatto.partner ? {
          ...contatto.partner,
          weekday_text: Array.isArray(contatto.partner.weekday_text) 
            ? contatto.partner.weekday_text 
            : contatto.partner.weekday_text 
              ? (typeof contatto.partner.weekday_text === 'string' 
                  ? JSON.parse(contatto.partner.weekday_text as string) 
                  : contatto.partner.weekday_text)
              : [],
          richiesta_stazioni: contatto.partner.richiesta_stazioni 
            ? (typeof contatto.partner.richiesta_stazioni === 'string' 
                ? JSON.parse(contatto.partner.richiesta_stazioni as string) 
                : contatto.partner.richiesta_stazioni)
            : null,
          stazioni_allocate: contatto.partner.stazioni_allocate 
            ? (typeof contatto.partner.stazioni_allocate === 'string' 
                ? JSON.parse(contatto.partner.stazioni_allocate as string) 
                : contatto.partner.stazioni_allocate)
            : null,
        } : null
      })) || [];

      console.log(`✅ Fetched ${processedData?.length || 0} contatti`);
      console.log("📊 Sample partner data:", processedData?.[0]?.partner);
      return processedData;
    },
    enabled: !isGestore || (isGestore && areaIds.length > 0),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
