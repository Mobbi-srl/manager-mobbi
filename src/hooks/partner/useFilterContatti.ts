
import { useMemo } from "react";
import { Contatto } from "./partnerTypes";

export const useFilterContatti = (contatti: Contatto[] | undefined, searchTerm: string) => {
  return useMemo(() => {
    if (!contatti) return [];
    
    if (!searchTerm) return contatti;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return contatti.filter((contatto) => {
      return (
        ((contatto.nome || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.cognome || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.email || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.partner?.ragione_sociale || "").toLowerCase()).includes(searchTermLower) ||
        ((contatto.partner?.nome_locale || "").toLowerCase()).includes(searchTermLower)
      );
    });
  }, [contatti, searchTerm]);
};
