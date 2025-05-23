
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];

type Comune = {
  id: string;
  nome: string;
  regione: string;
};

export const useCapoluoghiByRegione = (regione?: RegioneItaliana) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["comuni", regione ?? "ALL"],
    queryFn: async () => {
      try {
        let query = supabase
          .from("comuni_italiani")
          .select("id, nome, regione");
        
        // Se è specificata una regione, filtriamo direttamente nel database
        if (regione) {
          query = query.eq('regione', regione);
        }
        
        // Ordiniamo per nome per facilitare la selezione
        const { data, error } = await query
          .order("nome");
          
        if (error) {
          console.error("Errore caricamento comuni:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn(
            regione
              ? `Nessun comune trovato per la regione ${regione}`
              : "Nessun comune trovato in Italia"
          );
          return [] as Comune[];
        } else {
          console.log(`${data.length} comuni trovati ${regione ? `per la regione ${regione}` : 'totali'}`);
        }
        
        return data as Comune[];
      } catch (error) {
        console.error("Errore nella query dei comuni:", error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minuti - riduciamo le richieste al database
  });

  return {
    capoluoghi: data ?? [],
    isLoading: isLoading || isFetching,
    error,
  };
};
