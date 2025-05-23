
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AreaFormData, RegioneItaliana } from "./types";

/**
 * Hook per creare una nuova area geografica
 */
export const useCreateArea = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const registerAreaActivity = async (area: any) => {
    try {
      // Registra attività
      await supabase.from("attivita").insert({
        tipo: "area_nuova",
        descrizione: `Attivata nuova area: ${area.nome} in ${area.regione}`,
        utente_id: user?.id,
        dati: { area }
      });
      
      // Invia notifiche agli utenti con ruoli amministrativi
      const { data: utenti } = await supabase
        .from("anagrafica_utenti")
        .select("id, ruolo")
        .in("ruolo", ["Gestore", "Master", "SuperAdmin", "Agenzia", "Ambassador"]);
      
      if (utenti && utenti.length > 0) {
        const notifiche = utenti.map(utente => ({
          utente_id: utente.id,
          titolo: "Nuova area geografica",
          messaggio: `È stata attivata una nuova area: ${area.nome} in ${area.regione}`,
          tipo: "area_nuova",
        }));
        
        await supabase.from("notifiche").insert(notifiche);
      }
      
      queryClient.invalidateQueries({ queryKey: ["attivita"] });
      queryClient.invalidateQueries({ queryKey: ["notifiche"] });
      
    } catch (error) {
      console.error("Errore durante la registrazione dell'attività:", error);
    }
  };

  return useMutation({
    mutationFn: async (formData: AreaFormData) => {
      try {
        console.log("Creating area with data:", formData);
        
        // Fase 1: Creazione area geografica con provincia e comuni
        const { data: areaRows, error: areaError } = await supabase
          .from("aree_geografiche")
          .insert({
            nome: formData.nome,
            regione: formData.regione as RegioneItaliana,
            provincia: formData.provincia, // Salva la provincia
            comuni: formData.capoluoghi, // Salva i comuni come array
            descrizione: formData.descrizione || null,
            stato: "attiva",
            numero_stazioni: formData.numero_stazioni ?? 0,
          })
          .select();
        
        if (areaError) throw areaError;
        if (!areaRows || areaRows.length === 0) throw new Error("Area creata ma nessun dato restituito");
        
        const area = areaRows[0];
        console.log("Area creata:", area);

        // Fase 2: Collegamento capoluoghi - For each comune name, find or create a record in capoluoghi table
        for (const comuneNome of formData.capoluoghi) {
          // Check if this comune already exists in the capoluoghi table
          let capoluogoId;
          
          const { data: existingCapoluogho } = await supabase
            .from("capoluoghi")
            .select("id")
            .eq("nome", comuneNome)
            .eq("regione", formData.regione as RegioneItaliana)
            .maybeSingle();
          
          if (existingCapoluogho) {
            // If exists, use the existing ID
            capoluogoId = existingCapoluogho.id;
            console.log(`Using existing capoluogo: ${comuneNome} with ID ${capoluogoId}`);
          } else {
            // If not exists, create a new record
            const { data: newCapoluogo, error: newCapError } = await supabase
              .from("capoluoghi")
              .insert({
                nome: comuneNome,
                regione: formData.regione as RegioneItaliana
              })
              .select();
              
            if (newCapError) {
              console.error(`Error creating capoluogo ${comuneNome}:`, newCapError);
              throw newCapError;
            }
            
            capoluogoId = newCapoluogo[0].id;
            console.log(`Created new capoluogo: ${comuneNome} with ID ${capoluogoId}`);
          }
          
          // Link the capoluogo to the area
          const { error: linkError } = await supabase
            .from("aree_capoluoghi")
            .insert({
              area_id: area.id,
              capoluogo_id: capoluogoId,
            });
          
          if (linkError) {
            console.error(`Error linking capoluogo ${comuneNome} to area:`, linkError);
            throw linkError;
          }
        }

        // Fase 3: Registra attività e notifiche
        await registerAreaActivity(area);

        return area;
      } catch (error) {
        console.error("Errore durante la creazione dell'area:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Area geografica attivata con successo!");
      queryClient.invalidateQueries({ queryKey: ["aree_geografiche"] });
    },
    onError: (error: any) => {
      console.error("Errore creazione area:", error);
      toast.error(`Errore durante l'attivazione dell'area: ${error.message}`);
    },
  });
};
