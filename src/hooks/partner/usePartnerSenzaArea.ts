
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export const usePartnerSenzaArea = (searchTerm: string = "") => {
  const { data: allContatti, isLoading, error } = useQuery({
    queryKey: ["partner-senza-area"],
    queryFn: async () => {
      console.log("🔍 Fetching partner senza area from partner_no_area table with their contatti");
      
      try {
        // Prima verifichiamo se ci sono dati nelle tabelle
        console.log("🔍 Checking data in partner_no_area table...");
        const { data: partnersCheck, error: partnersCheckError, count: partnersCount } = await supabase
          .from("partner_no_area")
          .select("*", { count: 'exact' });

        console.log("📊 Partners check result:", { 
          partnersCount, 
          partnersCheckError, 
          dataLength: partnersCheck?.length || 0 
        });

        console.log("🔍 Checking data in contatti_no_area table...");
        const { data: contattiCheck, error: contattiCheckError, count: contattiCount } = await supabase
          .from("contatti_no_area")
          .select("*", { count: 'exact' });

        console.log("📊 Contatti check result:", { 
          contattiCount, 
          contattiCheckError, 
          dataLength: contattiCheck?.length || 0 
        });

        if (partnersCheckError) {
          console.error("❌ Error checking partners:", partnersCheckError);
          throw partnersCheckError;
        }

        if (contattiCheckError) {
          console.error("❌ Error checking contatti:", contattiCheckError);
          throw contattiCheckError;
        }

        if (!partnersCheck || partnersCheck.length === 0) {
          console.log("⚠️ No partners found in partner_no_area table");
          return [];
        }

        if (!contattiCheck || contattiCheck.length === 0) {
          console.log("⚠️ No contatti found in contatti_no_area table");
          return [];
        }

        console.log(`✅ Found ${partnersCheck.length} partners and ${contattiCheck.length} contatti`);

        // Raggruppiamo i contatti per partner per evitare duplicati
        const partnersWithContatti = partnersCheck.map(partner => {
          console.log("🔄 Processing partner:", partner.id, partner.ragione_sociale || partner.nome_locale);
          
          // Trova tutti i contatti per questo partner
          const partnerContatti = contattiCheck.filter(contatto => contatto.partner_id === partner.id);
          
          console.log(`📋 Found ${partnerContatti.length} contatti for partner ${partner.id}`);
          
          // Se non ci sono contatti per questo partner, creiamo un contatto vuoto per mantenere il partner nella lista
          if (partnerContatti.length === 0) {
            console.log(`⚠️ No contatti found for partner ${partner.id}, creating empty contact`);
            return {
              id: `${partner.id}-empty`, // ID unico per evitare conflitti
              nome: '',
              cognome: '',
              ruolo: '',
              email: '',
              numero: '',
              partner_id: partner.id,
              partner: {
                id: partner.id,
                nome_locale: partner.nome_locale || '',
                ragione_sociale: partner.ragione_sociale || '',
                indirizzo_operativa: partner.indirizzo_operativa || '',
                citta_operativa: partner.citta_operativa || '',
                provincia_operativa: partner.provincia_operativa || '',
                regione_operativa: partner.regione_operativa || '',
                nazione_operativa: partner.nazione_operativa || '',
                tipologia_locale_id: partner.tipologia_locale_id,
                stato: partner.stato || 'CONTATTO',
                ranking: partner.ranking,
                ranking_confirmed: partner.ranking_confirmed || false,
                richiesta_stazioni: partner.richiesta_stazioni,
                stazioni_allocate: partner.stazioni_allocate,
                segnalato_da: partner.segnalato_da,
                codice_utente_segnalatore: partner.codice_utente_segnalatore,
                telefono: partner.telefono,
                email: partner.email,
                area_id: null,
                created_at: null,
                updated_at: null
              }
            };
          }

          // Usa solo il primo contatto per rappresentare il partner (evita duplicati)
          const primaryContact = partnerContatti[0];
          
          return {
            id: primaryContact.id,
            nome: primaryContact.nome || '',
            cognome: primaryContact.cognome || '',
            ruolo: primaryContact.ruolo || '',
            email: primaryContact.email || '',
            numero: primaryContact.numero || '',
            partner_id: primaryContact.partner_id,
            partner: {
              id: partner.id,
              nome_locale: partner.nome_locale || '',
              ragione_sociale: partner.ragione_sociale || '',
              indirizzo_operativa: partner.indirizzo_operativa || '',
              citta_operativa: partner.citta_operativa || '',
              provincia_operativa: partner.provincia_operativa || '',
              regione_operativa: partner.regione_operativa || '',
              nazione_operativa: partner.nazione_operativa || '',
              tipologia_locale_id: partner.tipologia_locale_id,
              stato: partner.stato || 'CONTATTO',
              ranking: partner.ranking,
              ranking_confirmed: partner.ranking_confirmed || false,
              richiesta_stazioni: partner.richiesta_stazioni,
              stazioni_allocate: partner.stazioni_allocate,
              segnalato_da: partner.segnalato_da,
              codice_utente_segnalatore: partner.codice_utente_segnalatore,
              telefono: partner.telefono,
              email: partner.email,
              area_id: null,
              created_at: null,
              updated_at: null
            },
            // Aggiungiamo tutti i contatti come metadato per eventuali usi futuri
            allContatti: partnerContatti
          };
        });

        console.log(`✅ Successfully transformed ${partnersWithContatti.length} partners (no duplicates)`);
        console.log("📋 Sample transformed partner:", partnersWithContatti[0]);

        // Ordina i dati per ragione sociale del partner
        const sortedContatti = partnersWithContatti.sort((a, b) => {
          const aRagioneSociale = a.partner?.ragione_sociale || a.partner?.nome_locale || '';
          const bRagioneSociale = b.partner?.ragione_sociale || b.partner?.nome_locale || '';
          return aRagioneSociale.localeCompare(bRagioneSociale);
        });

        console.log(`✅ Final result: ${sortedContatti.length} unique partners for partner senza area`);
        return sortedContatti;
        
      } catch (err) {
        console.error("💥 Unexpected error in usePartnerSenzaArea:", err);
        throw err;
      }
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Filtra i contatti in base al termine di ricerca
  const filteredContatti = useMemo(() => {
    console.log("🔍 Filtering contatti, raw data length:", allContatti?.length || 0);
    console.log("🔍 Search term:", searchTerm);
    
    if (!allContatti) {
      return [];
    }
    
    if (!searchTerm) {
      return allContatti;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    const filtered = allContatti.filter((contatto: any) => {
      return (
        ((contatto.nome || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.cognome || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.email || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.partner?.ragione_sociale || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.partner?.nome_locale || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.partner?.indirizzo_operativa || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.partner?.citta_operativa || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.partner?.provincia_operativa || "").toLowerCase()).includes(searchTermLower)
      );
    });
    
    console.log("✅ Filtered contatti:", filtered.length);
    return filtered;
  }, [allContatti, searchTerm]);

  return {
    contatti: allContatti,
    filteredContatti,
    isLoading,
    error
  };
};
